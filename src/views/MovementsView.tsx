import React, { useState } from 'react';
import { History, ArrowDownRight, ArrowUpRight, ArrowUpDown, Trash2, Download } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { ActivePage } from '../types/inventory';
import { ConfirmModal } from '../components/ConfirmModal';
import { exportToCsv, getTodayDateString } from '../lib/csvExport';

interface MovementsViewProps {
  onNavigate: (page: ActivePage) => void;
}

export const MovementsView: React.FC<MovementsViewProps> = ({ onNavigate }) => {
  const { movements } = useInventory();
  const [filterType, setFilterType] = useState<'all' | 'IN' | 'OUT'>('all');

  const filteredMovements = movements.filter((m) => {
    if (filterType === 'all') return true;
    return m.type === filterType;
  });

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  };

  const handleExportCSV = () => {
    if (movements.length === 0) return;
    const headers = ['Timestamp', 'Product Name', 'Type', 'Amount', 'Resulting Quantity'];
    const rows = movements.map((m) => [
      formatDate(m.timestamp),
      m.productName,
      m.type === 'IN' ? 'In' : 'Out',
      m.type === 'IN' ? `+${m.amount}` : `-${m.amount}`,
      m.resultingQuantity,
    ]);
    const filename = `stock-movements-${getTodayDateString()}.csv`;
    exportToCsv(filename, headers, rows);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#17211d]">Movements</h1>
            <span className="px-2 py-0.5 text-xs font-mono font-medium rounded-full bg-[#e8e3d5] text-[#3e4842]">
              {movements.length}
            </span>
          </div>
          <p className="text-xs text-[#6e7771] mt-0.5">
            {movements.length === 0
              ? 'No changes recorded yet'
              : `${movements.length} audit changes recorded`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={movements.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#1f2924] bg-white border border-[#dbd5c6] hover:bg-[#faf8f3] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-2xs transition-colors"
            title={
              movements.length === 0
                ? 'No movements recorded yet to export'
                : 'Export movement audit log to CSV'
            }
          >
            <Download className="w-3.5 h-3.5 text-[#0f5b43]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* When Empty: Exact match with Page 4 screenshot */}
      {movements.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#e5dfd2] shadow-2xs p-16 text-center max-w-3xl mx-auto my-6">
          <div className="w-12 h-12 rounded-full bg-[#f4f1e8] text-[#0f5b43] flex items-center justify-center mx-auto mb-4">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-[#18231e]">No movements yet</h3>
          <p className="text-xs text-[#6e7771] mt-1.5 max-w-sm mx-auto leading-relaxed">
            Stock in or out from the Stock page and every change will appear here.
          </p>
          <div className="mt-6">
            <button
              onClick={() => onNavigate('stock')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0f5b43] hover:bg-[#0b4835] rounded-lg shadow-xs transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Go to Stock page</span>
            </button>
          </div>
        </div>
      ) : (
        /* Populated movements table */
        <div className="bg-white rounded-xl border border-[#e5dfd2] shadow-2xs overflow-hidden">
          {/* Filter Bar */}
          <div className="p-3 border-b border-[#ece7dc] bg-[#faf8f3] flex items-center justify-between">
            <div className="flex items-center gap-1.5 p-1 bg-[#ede8db] rounded-lg">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  filterType === 'all'
                    ? 'bg-white text-[#17211d] shadow-2xs'
                    : 'text-[#566059] hover:text-[#17211d]'
                }`}
              >
                All Changes ({movements.length})
              </button>
              <button
                onClick={() => setFilterType('IN')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  filterType === 'IN'
                    ? 'bg-white text-[#0f5b43] shadow-2xs font-semibold'
                    : 'text-[#566059] hover:text-[#17211d]'
                }`}
              >
                Stock In
              </button>
              <button
                onClick={() => setFilterType('OUT')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  filterType === 'OUT'
                    ? 'bg-white text-[#b45309] shadow-2xs font-semibold'
                    : 'text-[#566059] hover:text-[#17211d]'
                }`}
              >
                Stock Out
              </button>
            </div>

            <span className="text-xs text-[#717b75]">
              Showing {filteredMovements.length} log {filteredMovements.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#ece7dc] text-[11px] font-semibold text-[#6d7770] uppercase tracking-wider bg-[#faf8f3]">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4 text-center">Type</th>
                  <th className="py-3 px-4 text-right">Change</th>
                  <th className="py-3 px-4 text-right">Resulting Stock</th>
                  <th className="py-3 px-4 text-right pr-6">Actor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2efe7] text-xs">
                {filteredMovements.map((m) => {
                  const isIn = m.type === 'IN';
                  return (
                    <tr key={m.id} className="hover:bg-[#faf9f5] transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[#6c7770] whitespace-nowrap tabular-nums">
                        {formatDate(m.timestamp)}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#18231e]">
                        {m.productName}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#6c7770]">
                        {m.productSku}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                            isIn
                              ? 'bg-[#edf7f2] text-[#136348] border border-[#cde8dc]'
                              : 'bg-[#fef3c7] text-[#92400e] border border-[#fde68a]'
                          }`}
                        >
                          {isIn ? (
                            <ArrowUpRight className="w-3 h-3 text-[#10b981]" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 text-[#f59e0b]" />
                          )}
                          <span>{isIn ? 'Stock In' : 'Stock Out'}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-right tabular-nums">
                        <span className={isIn ? 'text-[#0f5b43]' : 'text-[#b45309]'}>
                          {isIn ? `+${m.amount}` : `-${m.amount}`}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-right text-[#17211d] tabular-nums">
                        {m.resultingQuantity} units
                      </td>
                      <td className="py-3.5 px-4 text-right pr-6 text-[#6c7770] font-mono">
                        @{m.actor}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
