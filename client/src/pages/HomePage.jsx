import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import BudgetDimmer from '../components/BudgetDimmer';
import HeroBanner from '../components/HeroBanner';
import PriceHistoryModal from '../components/PriceHistoryModal';
import ProductCard from '../components/ProductCard';
import { fetchProducts } from '../services/api';

const HomePage = () => {
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'All';
  const [budget, setBudget] = useState(150000);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState('');
  const [historyProduct, setHistoryProduct] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    fetchProducts({ search, category })
      .then((data) => {
        if (!active) {
          return;
        }

        setProducts(data.products);
        setOffline(data.offline);
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message || 'Unable to load products.');
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
  }, [search, category]);

  return (
    <div className="space-y-4 pb-28">
      <HeroBanner />

      <BudgetDimmer budget={budget} onChange={setBudget} />

      {offline && (
        <div className="rounded-sm border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800">
          Backend is offline. Showing the built-in catalog with full local functionality.
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900 sm:text-xl">
          {search ? `Results for "${search}"` : category === 'All' ? 'Products for You' : `${category} Deals`}
        </h1>
        <span className="text-xs font-semibold text-gray-500">{products.length} products</span>
      </div>

      {error && (
        <div className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-80 animate-pulse rounded-sm bg-gray-200" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-sm bg-white py-16 shadow-card">
          <SearchX size={42} className="text-gray-300" />
          <p className="mt-3 text-sm font-semibold text-gray-700">No products found.</p>
          <p className="mt-1 text-xs text-gray-500">Try another search term or category.</p>
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              dimmed={product.currentPrice > budget}
              onPriceHistory={setHistoryProduct}
            />
          ))}
        </div>
      )}

      {historyProduct && <PriceHistoryModal product={historyProduct} onClose={() => setHistoryProduct(null)} />}
    </div>
  );
};

export default HomePage;
