import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  STORAGE_KEYS,
  addToCartRequest,
  calculateBreakdown,
  getCartRequest,
  isDemoToken,
  normalizeProduct,
  readJSON,
  removeFromCartRequest,
  writeJSON
} from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const normalizeCartItem = (item) => {
  const product = item.product || item.productId;

  if (!product || typeof product !== 'object') {
    return null;
  }

  return {
    product: normalizeProduct(product),
    quantity: Math.max(1, Number(item.quantity) || 1)
  };
};

export const CartProvider = ({ children }) => {
  const { token } = useAuth();
  const remoteEnabled = Boolean(token && !isDemoToken(token));
  const [items, setItems] = useState(() => readJSON(STORAGE_KEYS.cart, []).map(normalizeCartItem).filter(Boolean));
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(!remoteEnabled);

  useEffect(() => {
    writeJSON(STORAGE_KEYS.cart, items);
  }, [items]);

  useEffect(() => {
    if (!remoteEnabled) {
      setOffline(true);
      return undefined;
    }

    let active = true;
    setLoading(true);

    getCartRequest()
      .then((data) => {
        if (!active) {
          return;
        }

        setItems((data.cart || []).map(normalizeCartItem).filter(Boolean));
        setOffline(false);
      })
      .catch(() => {
        if (active) {
          setOffline(true);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [remoteEnabled, token]);

  const itemCount = useMemo(() => items.reduce((total, item) => total + item.quantity, 0), [items]);
  const breakdown = useMemo(() => calculateBreakdown(items), [items]);

  const addItem = useCallback(async (product, quantity = 1) => {
    const normalized = normalizeProduct(product);
    const numericQuantity = Math.max(1, Number(quantity) || 1);

    if (numericQuantity > normalized.stock) {
      throw new Error(`Only ${normalized.stock} units are available`);
    }

    const updateLocal = () => {
      setItems((current) => {
        const index = current.findIndex((item) => item.product.id === normalized.id);

        if (index >= 0) {
          const next = [...current];
          next[index] = { ...next[index], quantity: numericQuantity };
          return next;
        }

        return [...current, { product: normalized, quantity: numericQuantity }];
      });
    };

    if (remoteEnabled) {
      try {
        const data = await addToCartRequest(normalized.id, numericQuantity);
        setItems((data.cart || []).map(normalizeCartItem).filter(Boolean));
        setOffline(false);
        return;
      } catch (error) {
        setOffline(true);
      }
    }

    updateLocal();
  }, [remoteEnabled]);

  const removeItem = useCallback(async (productId) => {
    const id = String(productId);
    const index = items.findIndex((item) => item.product.id === id);
    const removed = index >= 0 ? items[index] : null;

    setItems((current) => current.filter((item) => item.product.id !== id));

    if (remoteEnabled) {
      try {
        const data = await removeFromCartRequest(id);
        setItems((data.cart || []).map(normalizeCartItem).filter(Boolean));
        setOffline(false);
      } catch (error) {
        setOffline(true);
      }
    }

    return removed;
  }, [items, remoteEnabled]);

  const restoreItem = useCallback(async (item, previousIndex = 0) => {
    if (!item) {
      return;
    }

    setItems((current) => {
      if (current.some((currentItem) => currentItem.product.id === item.product.id)) {
        return current;
      }

      const next = [...current];
      next.splice(Math.min(Math.max(previousIndex, 0), next.length), 0, item);
      return next;
    });

    if (remoteEnabled) {
      try {
        await addToCartRequest(item.product.id, item.quantity);
        setOffline(false);
      } catch (error) {
        setOffline(true);
      }
    }
  }, [remoteEnabled]);

  const setQuantity = useCallback(async (productId, quantity) => {
    const item = items.find((currentItem) => currentItem.product.id === String(productId));

    if (!item) {
      return;
    }

    if (Number(quantity) < 1) {
      await removeItem(productId);
      return;
    }

    await addItem(item.product, quantity);
  }, [items, addItem, removeItem]);

  const clearCart = useCallback(async () => {
    const ids = items.map((item) => item.product.id);
    setItems([]);

    if (remoteEnabled) {
      await Promise.all(ids.map((id) => removeFromCartRequest(id).catch(() => null)));
    }
  }, [items, remoteEnabled]);

  const value = useMemo(() => ({
    items,
    itemCount,
    breakdown,
    loading,
    offline,
    addItem,
    removeItem,
    restoreItem,
    setQuantity,
    clearCart
  }), [items, itemCount, breakdown, loading, offline, addItem, removeItem, restoreItem, setQuantity, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }

  return context;
};
