import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Check, GitCompareArrows, History, ShoppingCart } from 'lucide-react';
import PriceBreakdown from '../components/PriceBreakdown';
import PriceHistoryModal from '../components/PriceHistoryModal';
import { calculateBreakdown, discountPercent, fetchProduct, formatINR } from '../services/api';
import { useCart } from '../context/CartContext';
import { useCompare } from '../context/CompareContext';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toggleProduct, isSelected } = useCompare();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    fetchProduct(productId)
      .then((data) => {
        if (!active) {
          return;
        }

        setProduct(data.product);
        setQuantity(1);
        setActiveImage(0);
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message || 'Product not found.');
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
  }, [productId]);

  if (loading) {
    return <div className="h-96 animate-pulse rounded-sm bg-gray-200" />;
  }

  if (error || !product) {
    return (
      <div className="rounded-sm bg-white p-10 text-center shadow-card">
        <p className="text-sm font-semibold text-red-600">{error || 'Product not found.'}</p>
        <Link to="/" className="mt-4 inline-block text-sm font-bold text-flipkart-blue hover:underline">
          Back to products
        </Link>
      </div>
    );
  }

  const lowest = product.lowestPrice;
  const difference = Math.max(0, product.currentPrice - lowest);
  const isLowest = difference === 0;
  const breakdown = calculateBreakdown([{ product, quantity }]);

  const addToCart = async () => {
    await addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  const buyNow = async () => {
    await addItem(product, quantity);
    navigate('/cart');
  };

  return (
    <div className="space-y-4 pb-28">
      <div className="flex flex-wrap items-center gap-1 text-xs text-gray-500">
        <Link to="/" className="hover:text-flipkart-blue">Home</Link>
        <span>/</span>
        <Link to={`/?category=${product.category}`} className="hover:text-flipkart-blue">{product.category}</Link>
        <span>/</span>
        <span className="line-clamp-1 font-semibold text-gray-700">{product.name}</span>
      </div>

      <div className="rounded-sm bg-white p-4 shadow-card sm:p-6">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,42%)_minmax(0,58%)]">
          <div>
            <div className="flex h-80 items-center justify-center rounded-sm border border-gray-100 bg-white sm:h-96">
              <img src={product.images[activeImage]} alt={product.name} className="h-full w-full object-contain" />
            </div>
            {product.images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={`h-16 w-16 shrink-0 rounded-sm border p-1 ${
                      index === activeImage ? 'border-flipkart-blue' : 'border-gray-200'
                    }`}
                  >
                    <img src={image} alt="" className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-xl font-semibold leading-snug text-gray-900 sm:text-2xl">{product.name}</h1>

            <div className="mt-2 flex items-center gap-3">
              <span className="inline-flex items-center gap-1 rounded-sm bg-flipkart-green px-2 py-0.5 text-xs font-bold text-white">
                {Number(product.rating).toFixed(1)} ★
              </span>
              <span className="text-xs text-gray-500">{product.stock} units in stock</span>
            </div>

            <p className="mt-1 text-sm font-semibold text-flipkart-green">Special price</p>

            <div className="mt-2 flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">{formatINR(product.currentPrice)}</span>
              <span className="text-base text-gray-400 line-through">{formatINR(product.mrp)}</span>
              <span className="text-sm font-bold text-flipkart-green">{discountPercent(product)}% off</span>
            </div>

            <div
              className={`mt-4 w-fit rounded-sm px-3 py-2 text-sm font-bold ${
                isLowest ? 'bg-green-50 text-flipkart-green' : 'bg-amber-50 text-amber-700'
              }`}
            >
              {isLowest
                ? 'Lowest Price Ever! Great time to buy.'
                : `${formatINR(difference)} above lowest price — Consider setting an alert.`}
            </div>

            <button
              type="button"
              onClick={() => setShowHistory(true)}
              className="mt-3 flex items-center gap-2 text-sm font-bold text-flipkart-blue hover:underline"
            >
              <History size={17} />
              View 6-month price history
            </button>

            {product.shortDescription && (
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-600">{product.shortDescription}</p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-sm border border-gray-300">
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  className="h-10 w-10 text-lg text-gray-600 hover:bg-gray-50"
                >
                  −
                </button>
                <span className="w-10 text-center text-sm font-bold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.min(product.stock || 1, current + 1))}
                  className="h-10 w-10 text-lg text-gray-600 hover:bg-gray-50"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={addToCart}
                disabled={product.stock < 1}
                className="flex h-10 items-center gap-2 rounded-sm bg-flipkart-yellow px-6 text-sm font-bold text-gray-900 hover:bg-amber-500 disabled:opacity-50"
              >
                {added ? <Check size={17} /> : <ShoppingCart size={17} />}
                {added ? 'Added to Cart' : 'Add to Cart'}
              </button>

              <button
                type="button"
                onClick={buyNow}
                disabled={product.stock < 1}
                className="h-10 rounded-sm bg-flipkart-orange px-6 text-sm font-bold text-white hover:bg-orange-700 disabled:opacity-50"
              >
                Buy Now
              </button>

              <button
                type="button"
                onClick={() => toggleProduct(product)}
                className={`flex h-10 items-center gap-2 rounded-sm border px-4 text-sm font-bold ${
                  isSelected(product.id)
                    ? 'border-flipkart-blue bg-blue-50 text-flipkart-blue'
                    : 'border-gray-300 text-gray-700 hover:border-flipkart-blue'
                }`}
              >
                <GitCompareArrows size={16} />
                {isSelected(product.id) ? 'Added to Compare' : 'Compare'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-sm bg-white p-5 shadow-card">
          <h2 className="mb-4 text-base font-bold text-gray-900">Product Details</h2>
          {Object.keys(product.specs || {}).length > 0 ? (
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(product.specs || {}).map(([key, value]) => (
                  <tr key={key} className="border-b border-gray-100 last:border-0">
                    <th className="w-44 py-2 text-left font-medium capitalize text-gray-500">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </th>
                    <td className="py-2 font-semibold text-gray-800">{String(value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-gray-500">No additional specifications available.</p>
          )}
        </section>

        <PriceBreakdown breakdown={breakdown} />
      </div>

      {showHistory && <PriceHistoryModal product={product} onClose={() => setShowHistory(false)} />}
    </div>
  );
};

export default ProductDetailPage;
