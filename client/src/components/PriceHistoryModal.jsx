import { useState } from 'react';
import { BellRing, X } from 'lucide-react';
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { createPriceAlert, findProduct, formatINR, normalizeProduct } from '../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Title, Tooltip, Legend);

const PriceHistoryModal = ({ product: initialProduct, onClose }) => {
  const product = normalizeProduct(findProduct(initialProduct.id) || initialProduct);
  const history = product.priceHistory;
  const prices = history.map((entry) => entry.price);
  const lowestPrice = prices.length > 0 ? Math.min(...prices) : product.currentPrice;
  const difference = Math.max(0, product.currentPrice - lowestPrice);
  const [targetPrice, setTargetPrice] = useState(Math.max(1, Math.round(lowestPrice)));
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const chartData = {
    labels: history.map((entry) => {
      const date = new Date(`${String(entry.date).slice(0, 10)}T00:00:00`);
      return Number.isNaN(date.getTime())
        ? String(entry.date)
        : date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    }),
    datasets: [
      {
        label: 'Price',
        data: prices,
        borderColor: '#2874F0',
        backgroundColor: 'rgba(40, 116, 240, 0.12)',
        pointBackgroundColor: '#FB641B',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2.5,
        tension: 0.35,
        fill: true
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => ` Price: ${formatINR(context.parsed.y)}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6B7280', font: { size: 11 } }
      },
      y: {
        grid: { color: '#EEF2F6' },
        ticks: {
          color: '#6B7280',
          font: { size: 11 },
          callback: (value) => formatINR(value)
        }
      }
    }
  };

  const saveAlert = async () => {
    const numericTarget = Number(targetPrice);

    if (!Number.isFinite(numericTarget) || numericTarget <= 0) {
      setStatus('Enter a valid target price.');
      return;
    }

    setSaving(true);

    try {
      const result = await createPriceAlert(product.id, numericTarget);
      setStatus(result.message || `Alert set for ${formatINR(numericTarget)}.`);
    } catch (error) {
      setStatus(error.message || 'Unable to save the price alert.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3" onMouseDown={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-md bg-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Price History</h2>
            <p className="mt-0.5 line-clamp-1 text-sm text-gray-500">{product.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close price history"
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-5 py-4">
          <div className="h-64 sm:h-72">
            <Line data={chartData} options={chartOptions} />
          </div>

          <div
            className={`mt-4 rounded-sm px-4 py-3 text-sm font-semibold ${
              difference === 0
                ? 'bg-green-50 text-flipkart-green'
                : 'bg-amber-50 text-amber-700'
            }`}
          >
            {difference === 0
              ? 'Lowest Price Ever! Great time to buy.'
              : `${formatINR(difference)} above lowest price — Consider setting an alert.`}
          </div>

          <div className="mt-5 rounded-sm border border-gray-200 bg-gray-50 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-800">
              <BellRing size={17} className="text-flipkart-blue" />
              Set a target price alert
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex flex-1 items-center rounded-sm border border-gray-300 bg-white px-3">
                <span className="text-sm text-gray-500">₹</span>
                <input
                  type="number"
                  min="1"
                  value={targetPrice}
                  onChange={(event) => setTargetPrice(event.target.value)}
                  className="h-10 w-full px-2 text-sm outline-none"
                  aria-label="Target price"
                />
              </div>
              <button
                type="button"
                onClick={saveAlert}
                disabled={saving}
                className="rounded-sm bg-flipkart-blue px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Set Alert'}
              </button>
            </div>
            {status && <p className="mt-2 text-xs font-medium text-gray-600">{status}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceHistoryModal;
