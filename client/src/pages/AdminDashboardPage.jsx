import { useEffect, useState } from 'react';
import { DollarSign, Plus, Trash2 } from 'lucide-react';
import { CATEGORIES } from '../data/mockProducts';
import {
  createProductRequest,
  deleteProductRequest,
  fetchProducts,
  formatINR,
  getCatalog,
  updatePriceRequest
} from '../services/api';

const EMPTY_PRODUCT = {
  name: '',
  category: 'Mobiles',
  currentPrice: '',
  mrp: '',
  stock: '25',
  rating: '4.5',
  image: '',
  shortDescription: '',
  brand: '',
  model: '',
  color: '',
  warranty: ''
};

const AdminDashboardPage = () => {
  const [products, setProducts] = useState(() => getCatalog());
  const [newProduct, setNewProduct] = useState(EMPTY_PRODUCT);
  const [priceUpdates, setPriceUpdates] = useState({});
  const [deleteId, setDeleteId] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let active = true;

    fetchProducts({})
      .then((data) => {
        if (!active) {
          return;
        }

        setProducts(data.products);
        setOffline(data.offline);
      })
      .catch(() => {
        if (active) {
          setProducts(getCatalog());
          setOffline(true);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const updateNewProduct = (field) => (event) => {
    setNewProduct((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setMessage('');
    setBusy(true);

    const currentPrice = Number(newProduct.currentPrice);
    const mrp = Number(newProduct.mrp) || currentPrice;
    const specs = {};

    ['brand', 'model', 'color', 'warranty'].forEach((key) => {
      if (newProduct[key].trim()) {
        specs[key] = newProduct[key].trim();
      }
    });

    const payload = {
      name: newProduct.name.trim(),
      category: newProduct.category,
      currentPrice,
      mrp,
      stock: Number(newProduct.stock),
      rating: Number(newProduct.rating),
      images: newProduct.image.trim() ? [newProduct.image.trim()] : [],
      shortDescription: newProduct.shortDescription.trim(),
      specs,
      priceHistory: [{ price: currentPrice, date: new Date().toISOString() }]
    };

    try {
      const result = await createProductRequest(payload);
      setProducts((current) => [...current.filter((product) => product.id !== result.product.id), result.product]);
      setOffline(result.offline);
      setNewProduct(EMPTY_PRODUCT);
      setMessage(`Product "${result.product.name}" added${result.offline ? ' locally' : ''}.`);
    } catch (error) {
      setMessage(error.message || 'Unable to add the product.');
    } finally {
      setBusy(false);
    }
  };

  const handlePriceUpdate = async (product) => {
    const nextPrice = Number(priceUpdates[product.id]);

    if (!Number.isFinite(nextPrice) || nextPrice <= 0) {
      setMessage('Enter a valid price greater than zero.');
      return;
    }

    setBusy(true);
    setMessage('');

    try {
      const result = await updatePriceRequest(product.id, nextPrice);
      setProducts((current) => current.map((item) => (item.id === result.product.id ? result.product : item)));
      setPriceUpdates((current) => ({ ...current, [product.id]: '' }));
      setOffline(result.offline);
      setMessage(`Price updated for "${result.product.name}"${result.offline ? ' locally' : ''}.`);
    } catch (error) {
      setMessage(error.message || 'Unable to update the price.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    const product = products.find((item) => item.id === deleteId);

    if (!product || !window.confirm(`Deactivate "${product.name}"?`)) {
      return;
    }

    setBusy(true);
    setMessage('');

    try {
      const result = await deleteProductRequest(product.id);
      setProducts((current) => current.filter((item) => item.id !== product.id));
      setDeleteId('');
      setOffline(result.offline);
      setMessage(`"${product.name}" was deactivated${result.offline ? ' locally' : ''}.`);
    } catch (error) {
      setMessage(error.message || 'Unable to deactivate the product.');
    } finally {
      setBusy(false);
    }
  };

  const inputClass = 'h-10 w-full rounded-sm border border-gray-300 px-3 text-sm outline-none focus:border-flipkart-blue';

  return (
    <div className="space-y-4 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Manage the catalog, product prices, and availability.</p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-flipkart-blue">
          {products.length} products
        </span>
      </div>

      {offline && (
        <div className="rounded-sm border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800">
          Backend is offline. Admin changes are saved locally and reflected across the storefront.
        </div>
      )}

      {message && (
        <div className="rounded-sm border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-800">
          {message}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={handleCreate} className="rounded-sm bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <Plus size={18} className="text-flipkart-blue" />
            <h2 className="text-sm font-bold text-gray-900">Add New Product</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="mb-1 block text-xs font-bold uppercase text-gray-500">Product name</span>
              <input required value={newProduct.name} onChange={updateNewProduct('name')} className={inputClass} />
            </label>
            <label>
              <span className="mb-1 block text-xs font-bold uppercase text-gray-500">Category</span>
              <select value={newProduct.category} onChange={updateNewProduct('category')} className={inputClass}>
                {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
              </select>
            </label>
            <label>
              <span className="mb-1 block text-xs font-bold uppercase text-gray-500">Brand</span>
              <input value={newProduct.brand} onChange={updateNewProduct('brand')} className={inputClass} />
            </label>
            <label>
              <span className="mb-1 block text-xs font-bold uppercase text-gray-500">Current price</span>
              <input type="number" min="1" required value={newProduct.currentPrice} onChange={updateNewProduct('currentPrice')} className={inputClass} />
            </label>
            <label>
              <span className="mb-1 block text-xs font-bold uppercase text-gray-500">MRP</span>
              <input type="number" min="1" value={newProduct.mrp} onChange={updateNewProduct('mrp')} className={inputClass} />
            </label>
            <label>
              <span className="mb-1 block text-xs font-bold uppercase text-gray-500">Stock</span>
              <input type="number" min="0" required value={newProduct.stock} onChange={updateNewProduct('stock')} className={inputClass} />
            </label>
            <label>
              <span className="mb-1 block text-xs font-bold uppercase text-gray-500">Rating</span>
              <input type="number" min="0" max="5" step="0.1" value={newProduct.rating} onChange={updateNewProduct('rating')} className={inputClass} />
            </label>
            <label className="sm:col-span-2">
              <span className="mb-1 block text-xs font-bold uppercase text-gray-500">Image URL</span>
              <input type="url" value={newProduct.image} onChange={updateNewProduct('image')} placeholder="https://..." className={inputClass} />
            </label>
            <label className="sm:col-span-2">
              <span className="mb-1 block text-xs font-bold uppercase text-gray-500">Short description</span>
              <input value={newProduct.shortDescription} onChange={updateNewProduct('shortDescription')} className={inputClass} />
            </label>
            <label>
              <span className="mb-1 block text-xs font-bold uppercase text-gray-500">Model</span>
              <input value={newProduct.model} onChange={updateNewProduct('model')} className={inputClass} />
            </label>
            <label>
              <span className="mb-1 block text-xs font-bold uppercase text-gray-500">Color</span>
              <input value={newProduct.color} onChange={updateNewProduct('color')} className={inputClass} />
            </label>
            <label className="sm:col-span-2">
              <span className="mb-1 block text-xs font-bold uppercase text-gray-500">Warranty</span>
              <input value={newProduct.warranty} onChange={updateNewProduct('warranty')} className={inputClass} />
            </label>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-sm bg-flipkart-blue py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            <Plus size={16} />
            Add Product
          </button>
        </form>

        <div className="space-y-4">
          <section className="rounded-sm bg-white p-5 shadow-card">
            <div className="mb-4 flex items-center gap-2">
              <DollarSign size={18} className="text-flipkart-blue" />
              <h2 className="text-sm font-bold text-gray-900">Change Product Price</h2>
            </div>
            <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
              {products.map((product) => (
                <div key={product.id} className="flex flex-wrap items-center gap-2 rounded-sm border border-gray-100 p-2">
                  <img src={product.images[0]} alt="" className="h-10 w-10 object-contain" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-gray-800">{product.name}</p>
                    <p className="text-[11px] text-gray-500">Current: {formatINR(product.currentPrice)}</p>
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={priceUpdates[product.id] || ''}
                    onChange={(event) => setPriceUpdates((current) => ({ ...current, [product.id]: event.target.value }))}
                    placeholder="New price"
                    className="h-9 w-28 rounded-sm border border-gray-300 px-2 text-xs outline-none focus:border-flipkart-blue"
                  />
                  <button
                    type="button"
                    onClick={() => handlePriceUpdate(product)}
                    disabled={busy}
                    className="rounded-sm bg-flipkart-yellow px-3 py-2 text-xs font-bold text-gray-900 hover:bg-amber-500 disabled:opacity-50"
                  >
                    Update
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-sm bg-white p-5 shadow-card">
            <div className="mb-4 flex items-center gap-2">
              <Trash2 size={18} className="text-red-600" />
              <h2 className="text-sm font-bold text-gray-900">Deactivate Product</h2>
            </div>
            <select
              value={deleteId}
              onChange={(event) => setDeleteId(event.target.value)}
              className={inputClass}
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleDelete}
              disabled={busy || !deleteId}
              className="mt-3 w-full rounded-sm bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
            >
              Deactivate Product
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
