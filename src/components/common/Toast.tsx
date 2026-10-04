import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, XCircle, X, RotateCcw } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = 'border-[#0E2F76]/30';
        let icon = <Info className="w-4 h-4 text-[#0E2F76] shrink-0" />;

        if (toast.type === 'success') {
          borderClass = 'border-emerald-500/40';
          icon = <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
        } else if (toast.type === 'warning') {
          borderClass = 'border-amber-500/40';
          icon = <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />;
        } else if (toast.type === 'error') {
          borderClass = 'border-rose-500/40';
          icon = <XCircle className="w-4 h-4 text-rose-600 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 bg-white text-[#0A0A0A] rounded-xl border ${borderClass} shadow-lg text-sm`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {icon}
              <span className="font-medium text-xs sm:text-sm leading-snug truncate">
                {toast.message}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {toast.undoAction && (
                <button
                  onClick={() => {
                    toast.undoAction?.();
                    dismissToast(toast.id);
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-[#0E2F76] bg-[#A9C0E0]/30 hover:bg-[#A9C0E0]/50 px-2 py-1 rounded-lg cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{toast.undoLabel || 'Undo'}</span>
                </button>
              )}

              <button
                onClick={() => dismissToast(toast.id)}
                className="text-neutral-400 hover:text-neutral-700 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
