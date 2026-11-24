import { useState } from 'react';
import { Check, Scale, X } from 'lucide-react';
import { formatINR } from '../services/api';
import { useCompare } from '../context/CompareContext';
import CompareModal from './CompareModal';

const CompareBar = () => {
  const { selected, notice, clearCompare, setNotice } = useCompare();
  const [showModal, setShowModal] = useState(false);

  if (selected.length === 0 && !notice) {
    return null;
  }

  return (
    <>
      {notice && (
        <div className="fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-xs font-semibold text-white shadow-lg">
          <Scale size={14} className="text-flipkart-plus" />
          {notice}
          <button type="button" aria-label="Dismiss notice" onClick={() => setNotice('')}>
            <X size={13} className="text-gray-300 hover:text-white" />
          </button>
        </div>
      )}

      {selected.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.12)]">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
              <Scale size={18} className="text-flipkart-blue" />
              Compare Products
            </div>

            <div className="flex flex-1 flex-wrap items-center gap-2">
              {[0, 1, 2].map((index) => {
                const product = selected[index];

                return product ? (
                  <div key={product.id} className="flex w-44 items-center gap-2 rounded-sm border border-gray-200 bg-white p-1.5">
                    <img src={product.images[0]} alt="" className="h-9 w-9 object-contain" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[11px] font-semibold text-gray-700">{product.name}</span>
                      <span className="block text-[10px] text-flipkart-blue">{formatINR(product.currentPrice)}</span>
                    </span>
                    <Check size={14} className="shrink-0 text-flipkart-green" />
                  </div>
                ) : (
                  <div key={`empty-${index}`} className="hidden h-14 w-44 items-center justify-center rounded-sm border border-dashed border-gray-300 text-[11px] text-gray-400 sm:flex">
                    Add a product
                  </div>
                );
              })}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={clearCompare}
                className="rounded-sm px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                disabled={selected.length < 2}
                className="rounded-sm bg-flipkart-orange px-5 py-2 text-xs font-bold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Compare Now
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && <CompareModal selected={selected} onClose={() => setShowModal(false)} />}
    </>
  );
};

export default CompareBar;
