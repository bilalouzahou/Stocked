import React from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error';
  title: string;
  description?: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-start gap-3 p-3.5 bg-[#17211d] text-white rounded-xl shadow-xl border border-white/10 max-w-sm animate-in slide-in-from-bottom-3 duration-200">
      {isSuccess ? (
        <CheckCircle2 className="w-5 h-5 text-[#34d399] shrink-0 mt-0.5" />
      ) : (
        <AlertTriangle className="w-5 h-5 text-[#fbbf24] shrink-0 mt-0.5" />
      )}
      <div className="flex-1 text-xs">
        <p className="font-semibold text-white">{toast.title}</p>
        {toast.description && <p className="text-white/80 mt-0.5">{toast.description}</p>}
      </div>
      <button
        onClick={onDismiss}
        className="p-1 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
