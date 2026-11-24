import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, PackageCheck } from 'lucide-react';
import PriceBreakdown from '../components/PriceBreakdown';
import { formatINR } from '../services/api';

const OrderSuccessPage = () => {
  const location = useLocation();
  const order = location.state && location.state.order;
  const offline = Boolean(location.state && location.state.offline);
  const message = location.state && location.state.message;

  if (!order) {
    return (
      <div className="rounded-sm bg-white p-12 text-center shadow-card">
        <h1 className="text-lg font-bold text-gray-800">No recent order found</h1>
        <p className="mt-1 text-sm text-gray-500">Orders placed in this session appear here.</p>
        <Link to="/" className="mt-5 inline-block rounded-sm bg-flipkart-blue px-5 py-2 text-sm font-bold text-white">
          Go to Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 pb-16">
      <div className="rounded-sm bg-white p-6 text-center shadow-card">
        <CheckCircle2 size={48} className="mx-auto text-flipkart-green" />
        <h1 className="mt-3 text-xl font-bold text-gray-900">Order placed successfully!</h1>
        <p className="mt-1 text-sm text-gray-500">Thank you for shopping with EKart.</p>
        <p className="mt-3 text-sm font-bold text-gray-800">Order ID: {order.id}</p>
        {order.paymentId && <p className="mt-1 text-xs text-gray-500">Payment ID: {order.paymentId}</p>}
        {offline && (
          <p className="mx-auto mt-4 max-w-lg rounded-sm bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800">
            {message || 'This order was saved locally because the backend was unavailable.'}
          </p>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <section className="rounded-sm bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <PackageCheck size={18} className="text-flipkart-blue" />
            <h2 className="text-sm font-bold text-gray-900">Items in this order</h2>
          </div>
          <div className="space-y-3">
            {(order.items || []).map((item) => (
              <div key={item.product.id} className="flex items-center gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <img src={item.product.images[0]} alt="" className="h-14 w-14 object-contain" />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-semibold text-gray-800">{item.product.name}</p>
                  <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                </div>
                <p className="text-sm font-bold text-gray-900">{formatINR(item.product.currentPrice * item.quantity)}</p>
              </div>
            ))}
          </div>

          {order.shippingAddress && (
            <div className="mt-5 border-t border-gray-100 pt-4 text-sm">
              <p className="font-bold text-gray-800">Delivering to</p>
              <p className="mt-1 text-gray-600">
                {order.shippingAddress.fullName}, {order.shippingAddress.line1},{' '}
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
              </p>
              <p className="mt-1 text-gray-600">Phone: {order.shippingAddress.phone}</p>
              <p className="mt-1 text-xs font-semibold text-flipkart-green">{order.paymentStatus}</p>
            </div>
          )}
        </section>

        <PriceBreakdown breakdown={order.breakdown} />
      </div>

      <div className="text-center">
        <Link to="/" className="inline-block rounded-sm bg-flipkart-blue px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
