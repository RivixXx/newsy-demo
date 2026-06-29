'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (type: ToastType, message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((type: ToastType, message: string, duration = 4000) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
    setToasts(prev => [...prev, { id, type, message, duration }]);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onRemove={() => remove(t.id)} />
        ))}
      </div>
      <style>{`
        .toast-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 10px;
          pointer-events: none;
        }
        .toast-item {
          pointer-events: all;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 18px;
          border-radius: 14px;
          background: white;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          border: 1px solid #f0f0f0;
          min-width: 280px;
          max-width: 420px;
          animation: toastIn 0.35s cubic-bezier(0.22, 1, 0.36, 1);
          transition: opacity 0.3s, transform 0.3s;
        }
        .toast-item.exiting {
          opacity: 0;
          transform: translateX(40px);
        }
        .toast-icon { flex-shrink: 0; }
        .toast-message { flex: 1; font-size: 14px; font-weight: 600; color: #111; line-height: 1.4; }
        .toast-close {
          flex-shrink: 0; width: 24px; height: 24px; border-radius: 6px;
          border: none; background: transparent; cursor: pointer;
          display: grid; place-items: center; color: #aaa; transition: all 0.15s;
        }
        .toast-close:hover { background: #f3f4f6; color: #333; }
        .toast-item.success { border-left: 4px solid #16a34a; }
        .toast-item.success .toast-icon { color: #16a34a; }
        .toast-item.error { border-left: 4px solid #ef4444; }
        .toast-item.error .toast-icon { color: #ef4444; }
        .toast-item.warning { border-left: 4px solid #f59e0b; }
        .toast-item.warning .toast-icon { color: #f59e0b; }
        .toast-item.info { border-left: 4px solid #3b82f6; }
        .toast-item.info .toast-icon { color: #3b82f6; }
        @keyframes toastIn { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast: t, onRemove }: { toast: Toast; onRemove: () => void }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onRemove, 300);
    }, t.duration || 4000);
    return () => clearTimeout(timer);
  }, [t.duration, onRemove]);

  const icons = {
    success: <CheckCircle2 size={20} />,
    error: <XCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />,
  };

  return (
    <div className={`toast-item ${t.type} ${exiting ? 'exiting' : ''}`}>
      <span className="toast-icon">{icons[t.type]}</span>
      <span className="toast-message">{t.message}</span>
      <button className="toast-close" onClick={() => { setExiting(true); setTimeout(onRemove, 300); }}>
        <X size={14} />
      </button>
    </div>
  );
}
