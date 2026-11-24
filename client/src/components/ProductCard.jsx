import { Link } from 'react-router-dom';
import { History, ShoppingCart, Star } from 'lucide-react';
import { discountPercent, formatINR } from '../services/api';
import { useCart } from '../context/CartContext';
import { useCompare } from '../context/CompareContext';

const ProductCard = ({ product, dimmed = false, onPriceHistory }) => {
  const { addItem } = useCart();
  const { toggleProduct, isSelected } = useCompare();
  const selected = isSelected(product.id);
  const lowest = Number(product.lowestPrice) || Number(product.lowestHistoricalPrice) || 0;
  const isLowest = lowest > 0 && product.currentPrice <= lowest;
  const diff = Math.max(0, product.currentPrice - lowest);

  const handleAddToCart = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    await addItem(product, 1);
  };

  const handleCompare = (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleProduct(product);
  };

  const handlePriceHistory = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onPriceHistory(product);
  };

  return (
    <article
      className={`group flex flex-col rounded-sm border border-gray-100 bg-white p-4 shadow-card transition-all duration-300 hover:shadow-cardHover ${
        dimmed ? 'opacity-25 grayscale-[80%]' : 'opacity-100'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <Link to={`/product/${product.id}`} className="block h-40 w-full">
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </Link>
        <label className="flex shrink-0 cursor-pointer items-center gap-1 text-[11px] font-semibold text-gray-600">
          <input
            type="checkbox"
            checked={selected}
            onChange={handleCompare}
            onClick={(event) => event.stopPropagation()}
            className="h-4 w-4 accent-flipkart-blue"
          />
          Compare
        </label>
      </div>

      <Link to={`/product/${product.id}`} className="mt-2 block min-h-10 text-sm font-medium leading-tight text-gray-800 hover:text-flipkart-blue">
        <span className="line-clamp-2">{product.name}</span>
      </Link>

      <div className="mt-2 flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-sm bg-flipkart-green px-1.5 py-0.5 text-[11px] font-bold text-white">
          {Number(product.rating).toFixed(1)}
          <Star size={10} fill="currentColor" />
        </span>
        <span className="text-xs text-gray-500">{product.category}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-baseline gap-2">
        <span className="text-lg font-bold text-gray-900">{formatINR(product.currentPrice)}</span>
        <span className="text-xs text-gray-400 line-through">{formatINR(product.mrp)}</span>
        <span className="text-xs font-bold text-flipkart-green">{discountPercent(product)}% off</span>
      </div>

      {isLowest ? (
        <span className="mt-2 w-fit rounded-full bg-green-50 px-2 py-1 text-[10px] font-bold text-flipkart-green">
          Lowest Price Ever!
        </span>
      ) : (
        <span
          className="mt-2 w-fit rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700"
          title={`${formatINR(diff)} above the historical low`}
        >
          Wait for Drop
        </span>
      )}

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={handlePriceHistory}
          className="flex flex-1 items-center justify-center gap-1 rounded-sm border border-flipkart-blue px-2 py-2 text-xs font-bold text-flipkart-blue transition-colors hover:bg-blue-50"
        >
          <History size={14} />
          Price History
        </button>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={product.stock < 1}
          className="flex flex-1 items-center justify-center gap-1 rounded-sm bg-flipkart-yellow px-2 py-2 text-xs font-bold text-gray-900 transition-colors hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShoppingCart size={14} />
          Add to Cart
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
