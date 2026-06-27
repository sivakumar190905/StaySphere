import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info as InfoIcon, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: {
    success: (msg: string) => void;
    error: (msg: string) => void;
    warning: (msg: string) => void;
    info: (msg: string) => void;
  };
  confirm: (options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmOptions, setConfirmOptions] = useState<{
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  } | null>(null);

  const addToast = useCallback((message: string, type: ToastType, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useMemo(() => ({
    success: (msg: string) => addToast(msg, 'success'),
    error: (msg: string) => addToast(msg, 'error'),
    warning: (msg: string) => addToast(msg, 'warning'),
    info: (msg: string) => addToast(msg, 'info'),
  }), [addToast]);

  const confirm = useCallback((options: typeof confirmOptions) => {
    setConfirmOptions(options);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, confirm }}>
      {children}

      {/* Toast Overlay Container */}
      <div className="fixed top-24 right-6 z-55 flex flex-col gap-3 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((t) => {
            const iconMap = {
              success: <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />,
              error: <AlertCircle className="text-rose-500 shrink-0" size={18} />,
              warning: <AlertTriangle className="text-amber-500 shrink-0" size={18} />,
              info: <InfoIcon className="text-blue-500 shrink-0" size={18} />,
            };

            const borderMap = {
              success: 'border-emerald-100 bg-white/90 shadow-emerald-500/5',
              error: 'border-rose-100 bg-white/90 shadow-rose-500/5',
              warning: 'border-amber-100 bg-white/90 shadow-amber-500/5',
              info: 'border-blue-100 bg-white/90 shadow-blue-500/5',
            };

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-md shadow-lg font-inter text-xs text-slate-700 ${borderMap[t.type]}`}
              >
                {iconMap[t.type]}
                <div className="flex-1 text-left font-semibold leading-relaxed">
                  {t.message}
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-lg border-none bg-transparent cursor-pointer shrink-0"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {confirmOptions && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                confirmOptions.onCancel?.();
                setConfirmOptions(null);
              }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-6 border border-slate-100 shadow-2xl text-left font-inter space-y-5"
            >
              <div className="space-y-2">
                <h4 className="text-base font-extrabold text-slate-900 leading-snug">{confirmOptions.title}</h4>
                <p className="text-slate-500 text-xs leading-relaxed font-semibold">{confirmOptions.message}</p>
              </div>

              <div className="flex gap-2.5 justify-end">
                <button
                  onClick={() => {
                    confirmOptions.onCancel?.();
                    setConfirmOptions(null);
                  }}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-700 font-bold text-xs bg-white transition-colors cursor-pointer"
                >
                  {confirmOptions.cancelText || 'Cancel'}
                </button>
                <button
                  onClick={() => {
                    confirmOptions.onConfirm();
                    setConfirmOptions(null);
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-sm border-none cursor-pointer"
                >
                  {confirmOptions.confirmText || 'Confirm'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
};

// Help build the useMemo hook without errors by adding react imports
import { useMemo } from 'react';
