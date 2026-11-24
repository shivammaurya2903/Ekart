import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { STORAGE_KEYS, normalizeProduct, readJSON, writeJSON } from '../services/api';

const CompareContext = createContext(null);

export const CompareProvider = ({ children }) => {
  const [selected, setSelected] = useState(() => readJSON(STORAGE_KEYS.compare, []).map(normalizeProduct).filter(Boolean));
  const [notice, setNotice] = useState('');

  useEffect(() => {
    writeJSON(STORAGE_KEYS.compare, selected);
  }, [selected]);

  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timeout = setTimeout(() => setNotice(''), 2600);
    return () => clearTimeout(timeout);
  }, [notice]);

  const toggleProduct = (product) => {
    const normalized = normalizeProduct(product);
    const exists = selected.some((item) => item.id === normalized.id);

    if (exists) {
      setSelected((current) => current.filter((item) => item.id !== normalized.id));
      return;
    }

    if (selected.length >= 3) {
      setNotice('You can compare up to 3 products at a time.');
      return;
    }

    setSelected((current) => [...current, normalized]);
  };

  const clearCompare = () => setSelected([]);
  const isSelected = (productId) => selected.some((item) => item.id === String(productId));

  const value = useMemo(() => ({
    selected,
    notice,
    setNotice,
    toggleProduct,
    clearCompare,
    isSelected
  }), [selected, notice]);

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
};

export const useCompare = () => {
  const context = useContext(CompareContext);

  if (!context) {
    throw new Error('useCompare must be used inside CompareProvider');
  }

  return context;
};
