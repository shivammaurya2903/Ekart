import { RotateCcw } from 'lucide-react';
import { formatINR } from '../services/api';

const PRESETS = [
  { label: 'Under ₹5k', value: 5000 },
  { label: 'Under ₹25k', value: 25000 },
  { label: 'Under ₹50k', value: 50000 },
  { label: 'All', value: 150000 }
];

const BudgetDimmer = ({ budget, onChange }) => {
  const progress = ((budget - 1000) / (150000 - 1000)) * 100;

  return (
    <div className="sticky top-14 z-30 rounded-sm border border-gray-200 bg-white px-4 py-3 shadow-card sm:top-[88px]">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-800">Budget-first view</span>
          <span className="rounded-sm bg-blue-50 px-2 py-0.5 text-xs font-semibold text-flipkart-blue">
            {formatINR(budget)}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => onChange(preset.value)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                budget === preset.value
                  ? 'border-flipkart-blue bg-flipkart-blue text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-flipkart-blue hover:text-flipkart-blue'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="ml-auto hidden items-center gap-1 text-xs text-gray-500 sm:flex">
          <RotateCcw size={13} />
          Above-budget items stay visible but dimmed
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <span className="text-xs font-semibold text-gray-500">₹1,000</span>
        <input
          type="range"
          min="1000"
          max="150000"
          step="500"
          value={budget}
          onChange={(event) => onChange(Number(event.target.value))}
          aria-label="Budget filter"
          className="h-2 w-full cursor-pointer appearance-none rounded-full outline-none"
          style={{
            background: `linear-gradient(to right, #2874F0 ${progress}%, #E0E0E0 ${progress}%)`
          }}
        />
        <span className="text-xs font-semibold text-gray-500">₹1,50,000</span>
      </div>
    </div>
  );
};

export default BudgetDimmer;
