import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, ShieldCheck } from 'lucide-react';
import PriceBreakdown from '../components/PriceBreakdown';
import {
  createPaymentRequest,
  formatINR,
  getRazorpayKeyId,
  isNetworkError,
  saveLocalOrder as saveLocalOrderRecord,
  verifyPaymentRequest
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const EMPTY_ADDRESS = {
  fullName: '',
  phone: '',
  line1: '',
  city: '',
  state: '',
  pincode: ''
};

const loadRazorpayScript = () => new Promise((resolve) => {
  if (window.Razorpay) {
    resolve(true);
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { items, breakdown, offline, clearCart } = useCart();
  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const updateAddress = (field) => (event) => {
    setAddress((current) => ({ ...current, [field]: event.target.value }));
  };

  const saveLocalOrder = () => {
    const order = {
      id: `EKART-LOCAL-${Date.now().toString().slice(-8)}`,
      items: items.map((item) => ({ ...item })),
      breakdown: { ...breakdown },
      shippingAddress: { ...address },
      paymentStatus: 'Paid in Test Mode (Local)',
      createdAt: new Date().toISOString()
    };

    saveLocalOrderRecord(order);
    clearCart();
    navigate('/order-success', {
      state: {
        order,
        offline: true,
        message: 'Backend is offline. Your test order was saved locally on this device.'
      },
      replace: true
    });
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    setError('');

    if (!isAuthenticated || offline) {
      saveLocalOrder();
      return;
    }

    setProcessing(true);

    try {
      const payment = await createPaymentRequest(address);
      const keyId = payment.keyId || getRazorpayKeyId();

      if (!keyId) {
        setProcessing(false);
        saveLocalOrder();
        return;
      }

      const loaded = await loadRazorpayScript();

      if (!loaded) {
        throw new Error('Razorpay checkout could not be loaded. Please check your connection.');
      }

      const razorpay = new window.Razorpay({
        key: keyId,
        amount: payment.amount,
        currency: payment.currency || 'INR',
        name: 'EKart',
        description: `Order ${payment.orderId}`,
        order_id: payment.razorpayOrderId,
        prefill: {
          name: address.fullName,
          email: user ? user.email : '',
          contact: address.phone
        },
        notes: {
          shippingAddress: `${address.line1}, ${address.city}, ${address.state} ${address.pincode}`
        },
        theme: {
          color: '#2874F0'
        },
        handler: async (response) => {
          try {
            await verifyPaymentRequest({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            const order = {
              id: payment.orderId,
              items: items.map((item) => ({ ...item })),
              breakdown: { ...breakdown },
              shippingAddress: { ...address },
              paymentStatus: 'Paid',
              paymentId: response.razorpay_payment_id,
              createdAt: new Date().toISOString()
            };

            await clearCart();
            navigate('/order-success', { state: { order, offline: false }, replace: true });
          } catch (verificationError) {
            setProcessing(false);
            setError(verificationError.normalizedMessage || verificationError.message || 'Payment verification failed.');
          }
        },
        modal: {
          ondismiss: () => setProcessing(false)
        }
      });

      razorpay.open();
      setProcessing(false);
    } catch (requestError) {
      setProcessing(false);

      if (isNetworkError(requestError)) {
        saveLocalOrder();
        return;
      }

      setError(requestError.normalizedMessage || requestError.message || 'Unable to start payment.');
    }
  };

  if (items.length === 0) {
    return (
      <div className="rounded-sm bg-white p-12 text-center shadow-card">
        <h1 className="text-lg font-bold text-gray-800">Your cart is empty</h1>
        <p className="mt-1 text-sm text-gray-500">Add products before placing an order.</p>
        <Link to="/" className="mt-5 inline-block rounded-sm bg-flipkart-blue px-5 py-2 text-sm font-bold text-white">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <div className="mb-4 flex items-center gap-2">
        <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
        <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-flipkart-blue">
          <ShieldCheck size={12} />
          Razorpay Test Mode
        </span>
      </div>

      {error && (
        <div className="mb-4 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={placeOrder} className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <section className="rounded-sm bg-white p-5 shadow-card">
            <div className="mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-flipkart-blue" />
              <h2 className="text-sm font-bold text-gray-900">Shipping Address</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { field: 'fullName', label: 'Full name', placeholder: 'Enter full name' },
                { field: 'phone', label: 'Phone number', placeholder: '10-digit mobile number', type: 'tel', pattern: '[0-9]{10}' },
                { field: 'line1', label: 'Address line', placeholder: 'House no., street, area', className: 'sm:col-span-2' },
                { field: 'city', label: 'City', placeholder: 'City' },
                { field: 'state', label: 'State', placeholder: 'State' },
                { field: 'pincode', label: 'PIN code', placeholder: '6-digit PIN', type: 'text', pattern: '[0-9]{6}' }
              ].map((input) => (
                <label key={input.field} className={`block ${input.className || ''}`}>
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">{input.label}</span>
                  <input
                    type={input.type || 'text'}
                    required
                    pattern={input.pattern}
                    value={address[input.field]}
                    onChange={updateAddress(input.field)}
                    placeholder={input.placeholder}
                    className="h-11 w-full rounded-sm border border-gray-300 px-3 text-sm outline-none focus:border-flipkart-blue"
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-sm bg-white p-5 shadow-card">
            <h2 className="mb-4 text-sm font-bold text-gray-900">Order Summary</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <img src={item.product.images[0]} alt="" className="h-14 w-14 object-contain" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-semibold text-gray-800">{item.product.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{formatINR(item.product.currentPrice * item.quantity)}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <PriceBreakdown
            breakdown={breakdown}
            actionLabel={processing ? 'Opening Razorpay...' : 'Pay Securely'}
            onAction={placeOrder}
            loading={processing}
          />
          <div className="flex items-start gap-2 rounded-sm bg-blue-50 p-3 text-xs text-blue-800">
            <CreditCard size={16} className="mt-0.5 shrink-0" />
            <p>
              No real money is charged. Configure{' '}
              <code className="font-bold">VITE_RAZORPAY_KEY_ID</code> with a Razorpay Test Mode key for live checkout simulation.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
