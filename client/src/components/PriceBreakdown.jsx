import { formatINR } from '../services/api';

const PriceBreakdown = ({ breakdown, actionLabel, onAction, disabled = false, loading = false }) => {
  const hasItems = breakdown.subtotal > 0;

  return (
    <aside className="rounded-sm border border-gray-200 bg-white p-4 shadow-card">
      <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">Price Details</h3>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-gray-700">
          <span>MRP Total ({formatINR(breakdown.mrpTotal)})</span>
          <span>{formatINR(breakdown.mrpTotal)}</span>
        </div>
        <div className="flex justify-between text-flipkart-green">
          <span>Product Discount</span>
          <span>- {formatINR(breakdown.discount)}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Subtotal</span>
          <span>{formatINR(breakdown.subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>18% GST</span>
          <span>{formatINR(breakdown.gst)}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Delivery Fee</span>
          <span className={breakdown.deliveryFee === 0 && hasItems ? 'font-bold text-flipkart-green' : ''}>
            {breakdown.deliveryFee === 0 && hasItems ? 'FREE' : formatINR(breakdown.deliveryFee)}
          </span>
        </div>
      </div>

      <div className="my-4 border-t border-dashed border-gray-300" />

      <div className="flex items-center justify-between text-base font-bold text-gray-900">
        <span>Final Payable Amount</span>
        <span>{formatINR(breakdown.totalAmount)}</span>
      </div>

      {!hasItems && (
        <p className="mt-3 rounded-sm bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
          Add products to see a complete breakdown.
        </p>
      )}

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          disabled={disabled || loading || !hasItems}
          className="mt-5 w-full rounded-sm bg-flipkart-orange py-3 text-sm font-bold text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Processing...' : actionLabel}
        </button>
      )}

      <p className="mt-4 text-center text-[11px] leading-relaxed text-gray-500">
        Safe and Secure Payments. Easy returns. 100% Authentic products.
      </p>
    </aside>
  );
};

export default PriceBreakdown;
