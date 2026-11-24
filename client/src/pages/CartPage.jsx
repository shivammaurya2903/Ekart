import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import PriceBreakdown from '../components/PriceBreakdown';
import UndoToast from '../components/UndoToast';
import { formatINR } from '../services/api';
import { useCart } from '../context/CartContext';

const CartPage = () => {
  const navigate = useNavigate();
  const { items, itemCount, breakdown, offline, removeItem, restoreItem, setQuantity } = useCart();
  const [toast, setToast] = useState(null);

  const handleRemove = async (productId, index) => {
    const removed = await removeItem(productId);

    if (removed) {
      setToast({ removed, index });
    }
  };

  const handleUndo = async () => {
    if (!toast) {
      return;
    }

    await restoreItem(toast.removed, toast.index);
    setToast(null);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-sm bg-white py-20 shadow-card">
        <ShoppingBag size={48} className="text-gray-300" />
        <h1 className="mt-4 text-lg font-bold text-gray-800">Your cart is empty!</h1>
        <p className="mt-1 text-sm text-gray-500">Add items to it now.</p>
        <Link
          to="/"
          className="mt-6 rounded-sm bg-flipkart-blue px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">My Cart ({itemCount})</h1>
        {offline && (
          <span className="rounded-sm bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            Offline cart mode
          </span>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          <div className="hidden grid-cols-[1fr_120px_140px_40px] gap-4 rounded-sm bg-white px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 shadow-card sm:grid">
            <span>Product</span>
            <span className="text-center">Quantity</span>
            <span className="text-right">Price</span>
            <span />
          </div>

          {items.map((item, index) => (
            <article key={item.product.id} className="rounded-sm bg-white p-4 shadow-card">
              <div className="grid items-center gap-4 sm:grid-cols-[1fr_120px_140px_40px]">
                <div className="flex items-center gap-3">
                  <img src={item.product.images[0]} alt="" className="h-20 w-20 shrink-0 object-contain" />
                  <div className="min-w-0">
                    <Link to={`/product/${item.product.id}`} className="line-clamp-2 text-sm font-semibold text-gray-800 hover:text-flipkart-blue">
                      {item.product.name}
                    </Link>
                    <p className="mt-1 text-xs text-gray-500">Seller: EKart Retail</p>
                    <p className="mt-1 text-xs font-bold text-flipkart-green">
                      {item.product.stock > 0 ? 'In stock' : 'Out of stock'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity(item.product.id, item.quantity - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50"
                    aria-label={`Decrease quantity of ${item.product.name}`}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(item.product.id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-40"
                    aria-label={`Increase quantity of ${item.product.name}`}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className="text-right">
                  <p className="text-base font-bold text-gray-900">{formatINR(item.product.currentPrice * item.quantity)}</p>
                  <p className="text-xs text-gray-400 line-through">{formatINR(item.product.mrp * item.quantity)}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemove(item.product.id, index)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-red-600"
                  aria-label={`Remove ${item.product.name}`}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <PriceBreakdown
            breakdown={breakdown}
            actionLabel="Place Order"
            onAction={() => navigate('/checkout')}
          />
        </div>
      </div>

      <UndoToast toast={toast} onUndo={handleUndo} onDismiss={() => setToast(null)} />
    </div>
  );
};

export default CartPage;
