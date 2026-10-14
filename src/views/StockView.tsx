import React, { useState } from 'react';
import { Search, Plus, Minus, ArrowUpDown, X, Filter } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { StatusBadge } from '../components/StatusBadge';
import { ToastMessage } from '../components/Toast';

interface StockViewProps {
  onShowToast: (toast: ToastMessage) => void;
}

export const StockView: React.FC<StockViewProps> = ({ onShowToast }) => {
  const { products, adjustStock, stats, categories } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [amounts, setAmounts] = useState<Record<string, number>>({});
  const [loadingRow, setLoadingRow] = useState<string | null>(null);

  // Get amount for a product
  const getAmount = (productId: string) => {
    return amounts[productId] !== undefined ? amounts[productId] : 1;
  };

  const handleAmountChange = (productId: string, val: string) => {
    const parsed = parseInt(val, 10);
    const valid = isNaN(parsed) || parsed < 1 ? 1 : parsed;
    setAmounts((prev) => ({ ...prev, [productId]: valid }));
  };

  const handleStockAdjust = (productId: string, productName: string, type: 'IN' | 'OUT') => {
    const amount = getAmount(productId);
    setLoadingRow(productId);

    const result = adjustStock(productId, type, amount);

    setTimeout(() => {
      setLoadingRow(null);
      if (result.success) {
        onShowToast({
          id: `toast-${Date.now()}`,
          type: 'success',
          title: type === 'IN' ? `Stock In: +${amount} units` : `Stock Out: -${amount} units`,
          description: `Updated stock level for ${productName}.`,
        });
      } else {
        onShowToast({
          id: `toast-${Date.now()}`,
          type: 'warning',
          title: 'Adjustment Failed',
          description: result.error || 'Could not adjust stock.',
        });
      }
    }, 150);
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query);

    const matchesCategory =
      selectedCategory === 'all' || p.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#17211d]">Stock</h1>
            <span className="px-2 py-0.5 text-xs font-mono font-medium rounded-full bg-[#e8e3d5] text-[#3e4842]">
              {stats.totalProducts}
            </span>
          </div>
          <p className="text-xs text-[#6e7771] mt-0.5">
            {stats.lowStockCount} items need restocking
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-3 border border-[#e5dfd2] shadow-2xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8a948e] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products to adjust stock..."
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-[#faf8f4] border border-[#dcd6c7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f5b43]/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8a948e] hover:text-[#17211d]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#717b75]" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-[#faf8f4] border border-[#dcd6c7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f5b43]/30 text-[#17211d]"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-xl border border-[#e5dfd2] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#ece7dc] bg-[#faf8f3] text-[11px] font-semibold text-[#6d7770] uppercase tracking-wider">
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4 text-right">In Stock</th>
                <th className="py-3 px-4 text-right">Reorder</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right pr-6">Adjust Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2efe7] text-xs">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#7c8680]">
                    No items found matching the filter.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const currentAmount = getAmount(p.id);
                  const isProcessing = loadingRow === p.id;
                  const isLow = p.quantityInStock <= p.reorderLevel;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-[#faf9f5] transition-colors ${
                        isLow ? 'bg-[#fffdfa]' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-[#18231e] block">{p.name}</span>
                        <span className="text-[11px] text-[#717b75]">{p.category}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#6c7770]">{p.sku}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-right text-[#17211d] tabular-nums">
                        {p.quantityInStock}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-right text-[#6c7770] tabular-nums">
                        {p.reorderLevel}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge
                          quantity={p.quantityInStock}
                          reorderLevel={p.reorderLevel}
                        />
                      </td>
                      <td className="py-3.5 px-4 text-right pr-6 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Stepper Input */}
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={currentAmount}
                            onChange={(e) => handleAmountChange(p.id, e.target.value)}
                            className="w-14 px-2 py-1 text-center font-mono text-xs bg-[#faf8f4] border border-[#dcd6c7] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0f5b43]"
                            title="Adjustment quantity"
                          />

                          {/* - Out Button */}
                          <button
                            disabled={isProcessing || p.quantityInStock === 0}
                            onClick={() => handleStockAdjust(p.id, p.name, 'OUT')}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#854d0e] bg-[#fef3c7] hover:bg-[#fde68a] disabled:opacity-40 disabled:hover:bg-[#fef3c7] border border-[#fde68a] rounded-md transition-colors"
                            title="Stock Out: Decrease stock"
                          >
                            <Minus className="w-3 h-3" />
                            <span>Out</span>
                          </button>

                          {/* + In Button */}
                          <button
                            disabled={isProcessing}
                            onClick={() => handleStockAdjust(p.id, p.name, 'IN')}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-[#0f5b43] hover:bg-[#0b4835] disabled:opacity-50 border border-[#0f5b43] rounded-md transition-colors shadow-2xs"
                            title="Stock In: Increase stock"
                          >
                            <Plus className="w-3 h-3" />
                            <span>In</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
