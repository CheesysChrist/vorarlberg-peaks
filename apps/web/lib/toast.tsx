'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

type ToastType = 'success' | 'error';
interface ToastItem { id: number; message: string; type: ToastType }

type ShowToast = (message: string, type?: ToastType) => void;

const ToastContext = createContext<ShowToast>(() => {});

export function useToast(): ShowToast {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback<ShowToast>((message, type = 'success') => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              'px-5 py-2.5 rounded-xl shadow-lg text-sm font-semibold text-white',
              'animate-in fade-in slide-in-from-bottom-2 duration-200',
              t.type === 'success' ? 'bg-emerald-500' : 'bg-red-500',
            ].join(' ')}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
