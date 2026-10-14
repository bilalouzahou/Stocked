import React, { useState } from 'react';
import { X, RotateCcw, Database, ShieldCheck, Check } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { ConfirmModal } from '../components/ConfirmModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { resetToSampleData, stats } = useInventory();
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  if (!isOpen) return null;

  const handleReset = () => {
    resetToSampleData();
    setShowConfirmReset(false);
    setResetDone(true);
    setTimeout(() => setResetDone(false), 2500);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
        <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-[#e2ddd0] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#eeeae0] bg-[#faf8f3]">
            <div>
              <h3 className="text-base font-semibold text-[#18231e]">System Settings</h3>
              <p className="text-xs text-[#6e7871] mt-0.5">Preferences & data management</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-[#7c8680] hover:text-[#18231e] hover:bg-[#ede8db] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {/* System Status info */}
            <div className="bg-[#f7f5ed] rounded-lg p-3.5 border border-[#e5dfd2] space-y-2 text-xs">
              <div className="flex items-center gap-2 font-semibold text-[#17211d]">
                <Database className="w-4 h-4 text-[#0f5b43]" />
                <span>Inventory Database</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-[#556059]">
                <div>
                  <span className="text-[#858f88]">Products in DB:</span>{' '}
                  <span className="font-mono font-semibold text-[#17211d]">{stats.totalProducts}</span>
                </div>
                <div>
                  <span className="text-[#858f88]">Stock Units:</span>{' '}
                  <span className="font-mono font-semibold text-[#17211d]">{stats.totalStockUnits}</span>
                </div>
                <div>
                  <span className="text-[#858f88]">Storage Engine:</span>{' '}
                  <span className="font-mono text-[#17211d]">Persistent Store</span>
                </div>
                <div>
                  <span className="text-[#858f88]">Auth Status:</span>{' '}
                  <span className="text-[#0f5b43] font-semibold">Active (admin)</span>
                </div>
              </div>
            </div>

            {/* Reset to Sample Products */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#17211d]">
                Sample Dataset
              </label>
              <p className="text-xs text-[#6e7771]">
                Reset catalog back to the 12 initial products (Supplies, Coffee Beans, Brewing Equipment, Merchandise) and clear movement logs.
              </p>

              <button
                type="button"
                onClick={() => setShowConfirmReset(true)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-[#854d0e] bg-[#fef3c7] hover:bg-[#fde68a] border border-[#fde68a] rounded-lg transition-colors"
              >
                {resetDone ? (
                  <>
                    <Check className="w-4 h-4 text-[#0f5b43]" />
                    <span className="text-[#0f5b43]">Dataset Reset to Defaults</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset to 12 Seed Products</span>
                  </>
                )}
              </button>
            </div>

            {/* Account Info */}
            <div className="pt-3 border-t border-[#eeeae0] flex items-center justify-between text-xs text-[#6e7771]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#0f5b43]" />
                <span>Single-tenant admin authentication</span>
              </div>
              <span className="font-mono text-[11px]">v1.0.0</span>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-[#eeeae0] bg-[#faf8f3] flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0f5b43] hover:bg-[#0b4835] rounded-lg shadow-2xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirmReset}
        title="Reset Sample Inventory"
        message="This will overwrite current products with the default 12 seed items and reset movement history. Continue?"
        confirmLabel="Reset Dataset"
        isDestructive={false}
        onConfirm={handleReset}
        onCancel={() => setShowConfirmReset(false)}
      />
    </>
  );
};
