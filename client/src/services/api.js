import axios from 'axios';
import { MOCK_PRODUCTS } from '../data/mockProducts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';

export const STORAGE_KEYS = {
  token: 'ekart.token',
  user: 'ekart.user',
  cart: 'ekart.cart',
  compare: 'ekart.compare',
  localProducts: 'ekart.localProducts',
  deletedProducts: 'ekart.deletedProducts',
  alerts: 'ekart.alerts',
  orders: 'ekart.orders'
};

let authToken = localStorage.getItem(STORAGE_KEYS.token);

export const setAuthToken = (token) => {
  authToken = token || null;

  if (authToken) {
    localStorage.setItem(STORAGE_KEYS.token, authToken);
  } else {
    localStorage.removeItem(STORAGE_KEYS.token);
  }
};

export const getAuthToken = () => authToken || localStorage.getItem(STORAGE_KEYS.token);

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response && error.response.data;
    error.normalizedMessage = (data && (data.message || (data.error && data.error.description))) || error.message || 'Request failed';
    return Promise.reject(error);
  }
);

export const isNetworkError = (error) => Boolean(error && !error.response);
export const isClientError = (error) => Boolean(error && error.response && error.response.status >= 400 && error.response.status < 500);
export const isDemoToken = (token) => String(token || '').startsWith('demo-');

export const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
};

export const writeJSON = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

export const formatINR = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return '₹0';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2
  }).format(amount);
};

export const formatINRCompact = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return '₹0';
  }

  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(amount % 100000 === 0 ? 0 : 1)}L`;
  }

  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k`;
  }

  return formatINR(amount);
};

export const discountPercent = (product) => {
  const mrp = Number(product && product.mrp) || 0;
  const currentPrice = Number(product && product.currentPrice) || 0;

  if (mrp <= 0 || currentPrice >= mrp) {
    return 0;
  }

  return Math.round(((mrp - currentPrice) / mrp) * 100);
};

export const calculateBreakdown = (items = []) => {
  let mrpTotal = 0;
  let subtotal = 0;

  for (const item of items) {
    const product = item.product || item.productId || {};
    const quantity = Number(item.quantity) || 0;
    const mrp = Number(product.mrp) || 0;
    const price = Number(product.currentPrice) || 0;

    mrpTotal += mrp * quantity;
    subtotal += price * quantity;
  }

  mrpTotal = roundMoney(mrpTotal);
  subtotal = roundMoney(subtotal);

  const discount = roundMoney(Math.max(0, mrpTotal - subtotal));
  const gst = roundMoney(subtotal * 0.18);
  const deliveryFee = subtotal === 0 || subtotal >= 499 ? 0 : 49;
  const totalAmount = roundMoney(subtotal + gst + deliveryFee);

  return {
    mrpTotal,
    subtotal,
    discount,
    gst,
    deliveryFee,
    totalAmount
  };
};

export const normalizeProduct = (product) => {
  if (!product) {
    return null;
  }

  const id = product.id || product._id || product.productId;
  const priceHistory = Array.isArray(product.priceHistory)
    ? product.priceHistory
        .map((entry) => ({
          price: Number(entry.price),
          date: entry.date
        }))
        .filter((entry) => Number.isFinite(entry.price))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
    : [];
  const computedLowest = priceHistory.length > 0
    ? Math.min(...priceHistory.map((entry) => entry.price))
    : Number(product.currentPrice) || 0;
  const backendLowest = Number(product.lowestHistoricalPrice);
  const specs = product.specs instanceof Map
    ? Object.fromEntries(product.specs.entries())
    : product.specs && typeof product.specs === 'object'
      ? product.specs
      : {};

  return {
    ...product,
    id: String(id),
    _id: product._id || id,
    name: String(product.name || 'Untitled product'),
    category: String(product.category || 'Accessories'),
    specs,
    currentPrice: Number(product.currentPrice) || 0,
    mrp: Number(product.mrp) || Number(product.currentPrice) || 0,
    stock: Number.isFinite(Number(product.stock)) ? Number(product.stock) : 0,
    rating: Number.isFinite(Number(product.rating)) ? Number(product.rating) : 0,
    images: Array.isArray(product.images) && product.images.length > 0 ? product.images : [DEFAULT_IMAGE],
    priceHistory,
    lowestPrice: computedLowest,
    lowestHistoricalPrice: Number.isFinite(backendLowest) && backendLowest > 0 ? backendLowest : computedLowest
  };
};

export const getDeletedProductIds = () => readJSON(STORAGE_KEYS.deletedProducts, []).map(String);

export const getLocalProducts = () => readJSON(STORAGE_KEYS.localProducts, []).map(normalizeProduct).filter(Boolean);

export const writeLocalProducts = (products) => {
  writeJSON(STORAGE_KEYS.localProducts, products.map(normalizeProduct));
};

export const upsertLocalProduct = (product) => {
  const normalized = normalizeProduct(product);
  const products = getLocalProducts();
  const index = products.findIndex((item) => item.id === normalized.id);

  if (index >= 0) {
    products[index] = normalized;
  } else {
    products.push(normalized);
  }

  writeLocalProducts(products);
  return normalized;
};

export const markLocalProductDeleted = (productId) => {
  const id = String(productId);
  const deleted = getDeletedProductIds();

  if (!deleted.includes(id)) {
    deleted.push(id);
  }

  writeJSON(STORAGE_KEYS.deletedProducts, deleted);
  writeLocalProducts(getLocalProducts().filter((product) => product.id !== id));
};

export const getCatalog = () => {
  const deleted = new Set(getDeletedProductIds());
  const productsById = new Map();

  MOCK_PRODUCTS.forEach((product) => {
    const normalized = normalizeProduct(product);
    productsById.set(normalized.id, normalized);
  });

  getLocalProducts().forEach((product) => {
    productsById.set(product.id, product);
  });

  return Array.from(productsById.values()).filter((product) => !deleted.has(product.id));
};

export const findProduct = (productId) => getCatalog().find((product) => product.id === String(productId)) || null;

export const getSuggestions = (query) => {
  const normalizedQuery = String(query || '').trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  return getCatalog()
    .filter((product) => [
      product.name,
      product.category,
      ...Object.values(product.specs || {})
    ].join(' ').toLowerCase().includes(normalizedQuery))
    .slice(0, 6);
};

export const getRazorpayKeyId = () => import.meta.env.VITE_RAZORPAY_KEY_ID || '';

const filterFallbackProducts = (products, params = {}) => {
  let filtered = products;
  const search = String(params.search || '').trim().toLowerCase();
  const category = params.category;
  const maxPrice = Number(params.maxPrice);

  if (category && category !== 'All') {
    filtered = filtered.filter((product) => product.category === category);
  }

  if (search) {
    filtered = filtered.filter((product) => [
      product.name,
      product.category,
      ...Object.values(product.specs || {})
    ].join(' ').toLowerCase().includes(search));
  }

  if (Number.isFinite(maxPrice) && params.maxPrice !== '') {
    filtered = filtered.filter((product) => product.currentPrice <= maxPrice);
  }

  return filtered;
};

export const fetchProducts = async (params = {}) => {
  try {
    const response = await api.get('/products', { params });
    const deleted = new Set(getDeletedProductIds());
    const remoteProducts = (response.data.products || [])
      .map(normalizeProduct)
      .filter((product) => product && !deleted.has(product.id));
    const remoteIds = new Set(remoteProducts.map((product) => product.id));
    const localProducts = getLocalProducts().filter((product) => !remoteIds.has(product.id) && !deleted.has(product.id));
    const products = filterFallbackProducts([...remoteProducts, ...localProducts], params);

    return {
      products,
      total: products.length,
      offline: false
    };
  } catch (error) {
    if (!isNetworkError(error)) {
      throw new Error(error.normalizedMessage);
    }

    const products = filterFallbackProducts(getCatalog(), params);

    return {
      products,
      total: products.length,
      offline: true
    };
  }
};

export const fetchProduct = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}`);
    return {
      product: normalizeProduct(response.data),
      offline: false
    };
  } catch (error) {
    if (!isNetworkError(error) && !isClientError(error)) {
      throw new Error(error.normalizedMessage);
    }

    const product = findProduct(productId);

    if (!product) {
      throw new Error('Product not found');
    }

    return {
      product,
      offline: true
    };
  }
};

export const loginRequest = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const registerRequest = async (details) => {
  const response = await api.post('/auth/register', details);
  return response.data;
};

export const fetchProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const getCartRequest = async () => {
  const response = await api.get('/cart');
  return response.data;
};

export const addToCartRequest = async (productId, quantity) => {
  const response = await api.post('/cart', { productId, quantity });
  return response.data;
};

export const removeFromCartRequest = async (productId) => {
  const response = await api.delete(`/cart/${productId}`);
  return response.data;
};

export const getLocalAlerts = () => readJSON(STORAGE_KEYS.alerts, []);

export const saveLocalAlert = (productId, targetPrice) => {
  const alerts = getLocalAlerts().filter((alert) => String(alert.productId) !== String(productId));
  alerts.push({ productId: String(productId), targetPrice: Number(targetPrice), notified: false });
  writeJSON(STORAGE_KEYS.alerts, alerts);
  return alerts;
};

export const createPriceAlert = async (productId, targetPrice) => {
  try {
    const response = await api.post('/alerts', { productId, targetPrice });
    return {
      ...response.data,
      offline: false
    };
  } catch (error) {
    if (!isNetworkError(error) && !isClientError(error)) {
      throw new Error(error.normalizedMessage);
    }

    return {
      message: 'Target price saved locally. We will notify you when the backend is online.',
      alerts: saveLocalAlert(productId, targetPrice),
      offline: true
    };
  }
};

export const createPaymentRequest = async (shippingAddress) => {
  const response = await api.post('/orders/create-payment', { shippingAddress });
  return response.data;
};

export const verifyPaymentRequest = async (paymentPayload) => {
  const response = await api.post('/orders/verify', paymentPayload);
  return response.data;
};

export const saveLocalOrder = (order) => {
  const orders = readJSON(STORAGE_KEYS.orders, []);
  orders.unshift(order);
  writeJSON(STORAGE_KEYS.orders, orders);
  return order;
};

export const getLocalOrders = () => readJSON(STORAGE_KEYS.orders, []);

export const createProductRequest = async (payload) => {
  try {
    const response = await api.post('/products', payload);
    return {
      product: normalizeProduct(response.data),
      offline: false
    };
  } catch (error) {
    if (!isNetworkError(error) && !isClientError(error)) {
      throw new Error(error.normalizedMessage);
    }

    const product = upsertLocalProduct({
      ...payload,
      id: `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      priceHistory: [{ price: Number(payload.currentPrice), date: new Date().toISOString() }]
    });

    return {
      product,
      offline: true
    };
  }
};

export const updatePriceRequest = async (productId, currentPrice) => {
  try {
    const response = await api.patch(`/products/${productId}/price`, { currentPrice });
    return {
      product: normalizeProduct(response.data),
      offline: false
    };
  } catch (error) {
    if (!isNetworkError(error) && !isClientError(error)) {
      throw new Error(error.normalizedMessage);
    }

    const existing = findProduct(productId);

    if (!existing) {
      throw new Error('Product not found');
    }

    const product = upsertLocalProduct({
      ...existing,
      currentPrice: Number(currentPrice),
      priceHistory: [
        ...(existing.priceHistory || []),
        { price: Number(currentPrice), date: new Date().toISOString() }
      ]
    });

    return {
      product,
      offline: true
    };
  }
};

export const deleteProductRequest = async (productId) => {
  try {
    await api.delete(`/products/${productId}`);
    return { offline: false };
  } catch (error) {
    if (!isNetworkError(error) && !isClientError(error)) {
      throw new Error(error.normalizedMessage);
    }

    markLocalProductDeleted(productId);
    return { offline: true };
  }
};
