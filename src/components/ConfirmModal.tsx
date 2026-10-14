import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl border border-[#e2ddd0] p-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                isDestructive ? 'bg-[#fee2e2] text-[#dc2626]' : 'bg-[#e0f2fe] text-[#0284c7]'
              }`}
            >
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#18231e]">{title}</h4>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded text-[#7c8680] hover:text-[#18231e] hover:bg-[#ede8db]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#525e57] mt-3 pl-12 leading-relaxed">{message}</p>

        <div className="flex items-center justify-end gap-2.5 mt-5">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-1.5 text-xs font-medium text-[#4b5550] bg-[#f2efe7] hover:bg-[#e6e2d6] rounded-lg transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg shadow-xs transition-colors text-white ${
              isDestructive
                ? 'bg-[#dc2626] hover:bg-[#b91c1c]'
                : 'bg-[#0f5b43] hover:bg-[#0b4835]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
