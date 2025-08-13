'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration
    setTimeout(() => {
      removeToast(id);
    }, toast.duration || 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
};

const Toaster: React.FC = () => {
  const { toasts, removeToast } = useToast();

  const getIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-[#16A34A]" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-[#DC2626]" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />;
      case 'info':
        return <Info className="w-5 h-5 text-[#0284C7]" />;
    }
  };

  const getToastStyles = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-[#ECFDF5]',
          border: 'border-[#16A34A]/20',
          text: 'text-[#065F46]',
          icon: 'text-[#16A34A]'
        };
      case 'error':
        return {
          bg: 'bg-[#FEF2F2]',
          border: 'border-[#DC2626]/20',
          text: 'text-[#991B1B]',
          icon: 'text-[#DC2626]'
        };
      case 'warning':
        return {
          bg: 'bg-[#FFFBEB]',
          border: 'border-[#F59E0B]/20',
          text: 'text-[#92400E]',
          icon: 'text-[#F59E0B]'
        };
      case 'info':
        return {
          bg: 'bg-[#EFF6FF]',
          border: 'border-[#0284C7]/20',
          text: 'text-[#1E40AF]',
          icon: 'text-[#0284C7]'
        };
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3">
      <AnimatePresence>
        {toasts.map((toast) => {
          const styles = getToastStyles(toast.type);
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              className={`max-w-sm w-full p-4 rounded-xl border shadow-elevated ${styles.bg} ${styles.border}`}
            >
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 ${styles.icon}`}>
                  {getIcon(toast.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${styles.text}`}>
                    {toast.title}
                  </p>
                  {toast.message && (
                    <p className={`text-sm ${styles.text} opacity-80 mt-1`}>
                      {toast.message}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className={`flex-shrink-0 ${styles.text} opacity-60 hover:opacity-100 transition-opacity`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export { ToastProvider, Toaster };
