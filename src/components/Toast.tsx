import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info, Radio, X } from 'lucide-react';

export interface ToastNotification {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  timestamp?: string;
}

interface ToastProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';
        const isError = toast.type === 'error';

        let borderClass = 'border-cyan-500/40 bg-slate-950/95 text-slate-100 shadow-cyan-950/50';
        let icon = <Radio className="w-4 h-4 text-cyan-400 shrink-0" />;

        if (isSuccess) {
          borderClass = 'border-emerald-500/40 bg-slate-950/95 text-slate-100 shadow-emerald-950/50';
          icon = <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />;
        } else if (isWarning) {
          borderClass = 'border-amber-500/40 bg-slate-950/95 text-slate-100 shadow-amber-950/50';
          icon = <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
        } else if (isError) {
          borderClass = 'border-rose-500/40 bg-slate-950/95 text-slate-100 shadow-rose-950/50';
          icon = <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start justify-between gap-3 p-3.5 rounded-2xl border backdrop-blur-2xl shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-4 ${borderClass}`}
          >
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5">{icon}</div>
              <div>
                <p className="text-xs font-medium font-sans leading-snug">{toast.message}</p>
                {toast.timestamp && (
                  <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                    {toast.timestamp}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
