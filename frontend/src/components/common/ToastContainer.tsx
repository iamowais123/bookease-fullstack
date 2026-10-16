import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/index.js';
import { removeToast } from '../../store/toastSlice.js';

export const ToastContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector((state) => state.toast.toasts);

  return (
    <div className="fixed top-5 right-5 z-[99999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => dispatch(removeToast(toast.id))} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: {
    id: string;
    type: 'error' | 'success' | 'info' | 'warning';
    title?: string;
    message: string;
    duration?: number;
  };
  onClose: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration || 4500);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const typeConfig = {
    error: {
      bg: 'bg-rose-600 border-rose-500 text-white shadow-2xl shadow-rose-950/30',
      icon: <AlertCircle className="w-5 h-5 text-white shrink-0 mt-0.5" />,
      titleColor: 'text-white',
      msgColor: 'text-rose-100',
    },
    success: {
      bg: 'bg-emerald-600 border-emerald-500 text-white shadow-2xl shadow-emerald-950/30',
      icon: <CheckCircle2 className="w-5 h-5 text-white shrink-0 mt-0.5" />,
      titleColor: 'text-white',
      msgColor: 'text-emerald-100',
    },
    warning: {
      bg: 'bg-amber-600 border-amber-500 text-white shadow-2xl shadow-amber-950/30',
      icon: <AlertTriangle className="w-5 h-5 text-white shrink-0 mt-0.5" />,
      titleColor: 'text-white',
      msgColor: 'text-amber-100',
    },
    info: {
      bg: 'bg-blue-600 border-blue-500 text-white shadow-2xl shadow-blue-950/30',
      icon: <Info className="w-5 h-5 text-white shrink-0 mt-0.5" />,
      titleColor: 'text-white',
      msgColor: 'text-blue-100',
    },
  }[toast.type];

  return (
    <div
      className={`pointer-events-auto p-4 rounded-2xl border shadow-xl flex items-start justify-between gap-3 animate-in slide-in-from-top-3 fade-in duration-200 transition-all ${typeConfig.bg}`}
      role="alert"
    >
      <div className="flex items-start gap-3 min-w-0">
        {typeConfig.icon}
        <div className="min-w-0">
          {toast.title && (
            <p className={`text-xs font-extrabold tracking-wide uppercase ${typeConfig.titleColor}`}>
              {toast.title}
            </p>
          )}
          <p className={`text-xs leading-snug break-words mt-0.5 font-medium ${typeConfig.msgColor}`}>
            {toast.message}
          </p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
