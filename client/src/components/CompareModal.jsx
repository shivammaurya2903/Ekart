import { X } from 'lucide-react';
import { discountPercent, formatINR } from '../services/api';

const bestValue = (products, field, mode) => {
  if (products.length === 0) {
    return null;
  }

  const values = products.map((product) => Number(product[field]) || 0);
  const best = mode === 'max' ? Math.max(...values) : Math.min(...values);
  return products.find((product) => (Number(product[field]) || 0) === best)?.id || null;
};

const CompareModal = ({ selected, onClose }) => {
  const bestPriceId = bestValue(selected, 'currentPrice', 'min');
  const bestRatingId = bestValue(selected, 'rating', 'max');
  const bestMrpId = bestValue(selected, 'mrp', 'min');
  const bestDiscountId = bestValue(selected.map((product) => ({ ...product, computedDiscount: discountPercent(product) })), 'computedDiscount', 'max');
  const bestLowestId = bestValue(selected, 'lowestPrice', 'min');
  const bestStockId = bestValue(selected, 'stock', 'max');
  const specKeys = Array.from(new Set(selected.flatMap((product) => Object.keys(product.specs || {}))));

  const cellClass = (productId, bestId) => (productId === bestId ? 'bg-green-50 font-bold text-flipkart-green' : 'text-gray-700');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3" onMouseDown={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-md bg-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Side-by-side Comparison</h2>
            <p className="text-xs text-gray-500">Best values are highlighted in green.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close comparison"
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 w-40 border-b border-r border-gray-200 bg-gray-50 p-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                  Feature
                </th>
                {selected.map((product) => (
                  <th key={product.id} className="min-w-52 border-b border-gray-200 p-3 text-left">
                    <div className="flex items-center gap-3">
                      <img src={product.images[0]} alt="" className="h-14 w-14 object-contain" />
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-semibold text-gray-800">{product.name}</p>
                        <p className="mt-1 text-xs font-bold text-flipkart-blue">{formatINR(product.currentPrice)}</p>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <ComparisonRow label="Current Price" selected={selected} render={(product) => formatINR(product.currentPrice)} bestId={bestPriceId} cellClass={cellClass} />
              <ComparisonRow label="MRP" selected={selected} render={(product) => formatINR(product.mrp)} bestId={bestMrpId} cellClass={cellClass} />
              <ComparisonRow label="Discount" selected={selected} render={(product) => `${discountPercent(product)}%`} bestId={bestDiscountId} cellClass={cellClass} />
              <ComparisonRow label="Rating" selected={selected} render={(product) => `${Number(product.rating).toFixed(1)} / 5`} bestId={bestRatingId} cellClass={cellClass} />
              <ComparisonRow label="Historical Low" selected={selected} render={(product) => formatINR(product.lowestPrice)} bestId={bestLowestId} cellClass={cellClass} />
              <ComparisonRow label="Stock" selected={selected} render={(product) => `${product.stock} units`} bestId={bestStockId} cellClass={cellClass} />
              {specKeys.map((key) => (
                <tr key={key}>
                  <th className="sticky left-0 z-10 border-b border-r border-gray-200 bg-gray-50 p-3 text-left text-xs font-bold capitalize text-gray-600">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </th>
                  {selected.map((product) => (
                    <td key={product.id} className="border-b border-gray-200 p-3 text-gray-700">
                      {String((product.specs || {})[key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ComparisonRow = ({ label, selected, render, bestId, cellClass }) => (
  <tr>
    <th className="sticky left-0 z-10 border-b border-r border-gray-200 bg-gray-50 p-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600">
      {label}
    </th>
    {selected.map((product) => (
      <td key={product.id} className={`border-b border-gray-200 p-3 ${cellClass(product.id, bestId)}`}>
        {render(product)}
      </td>
    ))}
  </tr>
);

export default CompareModal;
