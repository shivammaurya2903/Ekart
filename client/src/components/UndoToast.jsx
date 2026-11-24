import { useEffect, useRef, useState } from 'react';
import { Undo2 } from 'lucide-react';

const DURATION = 5;

const UndoToast = ({ toast, onUndo, onDismiss }) => {
  const [remaining, setRemaining] = useState(DURATION);
  const dismissRef = useRef(onDismiss);

  useEffect(() => {
    dismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    setRemaining(DURATION);
    const startedAt = Date.now();

    const interval = setInterval(() => {
      const next = Math.max(0, DURATION - (Date.now() - startedAt) / 1000);
      setRemaining(next);

      if (next === 0) {
        clearInterval(interval);
        dismissRef.current();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [toast]);

  if (!toast || !toast.removed) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 z-50 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-sm bg-gray-900 text-white shadow-2xl sm:bottom-6">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Item removed from cart</p>
          <p className="truncate text-xs text-gray-300">{toast.removed.product.name}</p>
        </div>
        <button
          type="button"
          onClick={onUndo}
          className="flex shrink-0 items-center gap-1 rounded-sm bg-flipkart-orange px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-700"
        >
          <Undo2 size={14} />
          Undo
        </button>
      </div>
      <div className="h-1 bg-gray-700">
        <div
          className="h-full bg-flipkart-orange transition-[width] duration-100 ease-linear"
          style={{ width: `${(remaining / DURATION) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default UndoToast;
