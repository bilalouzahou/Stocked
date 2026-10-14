import React from 'react';
import { Package, AlertTriangle, ArrowRight, ArrowUpDown, Plus } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { StatusBadge } from '../components/StatusBadge';
import { ActivePage } from '../types/inventory';

interface DashboardViewProps {
  onNavigate: (page: ActivePage) => void;
  onOpenAddModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onOpenAddModal }) => {
  const { products, stats } = useInventory();

  // Format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(val);
  };

  // Prepare categories for bar chart
  const categoriesList = Object.entries(stats.categoryUnits)
    .sort((a, b) => b[1] - a[1]);

  const maxCategoryUnits = Math.max(...categoriesList.map(([, units]) => units), 1);

  // Low stock products list
  const lowStockProducts = products
    .filter((p) => p.quantityInStock <= p.reorderLevel)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#17211d]">Dashboard</h1>
          <p className="text-xs text-[#6e7771] mt-0.5">Inventory at a glance</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('stock')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#1f2924] bg-white border border-[#dbd5c6] hover:bg-[#faf8f3] rounded-lg shadow-2xs transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-[#0f5b43]" />
            <span>Manage Stock</span>
          </button>
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0f5b43] hover:bg-[#0b4835] rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add product</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* TOTAL PRODUCTS */}
        <div className="bg-white rounded-xl p-5 border border-[#e5dfd2] shadow-2xs">
          <span className="block text-[11px] font-semibold tracking-wider text-[#7c8680] uppercase">
            Total Products
          </span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono tracking-tight text-[#17211d] tabular-nums">
              {stats.totalProducts}
            </span>
            <span className="text-xs text-[#717b75]">active SKUs</span>
          </div>
        </div>

        {/* TOTAL STOCK VALUE */}
        <div className="bg-white rounded-xl p-5 border border-[#e5dfd2] shadow-2xs">
          <span className="block text-[11px] font-semibold tracking-wider text-[#7c8680] uppercase">
            Total Stock Value
          </span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono tracking-tight text-[#17211d] tabular-nums">
              {formatCurrency(stats.totalStockValue)}
            </span>
            <span className="text-xs text-[#717b75]">inventory valuation</span>
          </div>
        </div>

        {/* LOW ON STOCK */}
        <div className="bg-white rounded-xl p-5 border border-[#e5dfd2] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="block text-[11px] font-semibold tracking-wider text-[#7c8680] uppercase">
              Low on Stock
            </span>
            {stats.lowStockCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
            )}
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className={`text-3xl font-bold font-mono tracking-tight tabular-nums ${
              stats.lowStockCount > 0 ? 'text-[#b45309]' : 'text-[#17211d]'
            }`}>
              {stats.lowStockCount}
            </span>
            <span className="text-xs text-[#717b75]">at or below reorder level</span>
          </div>
        </div>
      </div>

      {/* Stock by Category Card (Matching Page 2 screenshot) */}
      <div className="bg-white rounded-xl p-6 border border-[#e5dfd2] shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#f1eee6]">
          <h2 className="text-sm font-semibold text-[#17211d]">Stock by category</h2>
          <span className="text-xs font-mono text-[#6f7872] tabular-nums">
            {stats.totalStockUnits} units total
          </span>
        </div>

        <div className="mt-6 space-y-4">
          {categoriesList.length === 0 ? (
            <p className="text-xs text-[#7c8680] py-4 text-center">No categories to display.</p>
          ) : (
            categoriesList.map(([category, units]) => {
              const percentage = Math.round((units / maxCategoryUnits) * 100);
              return (
                <div key={category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#2f3933]">{category}</span>
                    <span className="font-mono font-semibold text-[#17211d] tabular-nums">
                      {units}
                    </span>
                  </div>

                  {/* Horizontal Bar Track */}
                  <div className="h-4 bg-[#f2efe6] rounded-sm overflow-hidden p-0.5">
                    <div
                      className="h-full bg-[#0f5b43] rounded-xs transition-all duration-300"
                      style={{ width: `${Math.max(percentage, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Low Stock Items preview */}
      {stats.lowStockCount > 0 && (
        <div className="bg-white rounded-xl border border-[#e5dfd2] shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-[#f1eee6] bg-[#faf8f3]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#d97706]" />
              <h3 className="text-sm font-semibold text-[#17211d]">
                Items Requiring Attention ({stats.lowStockCount})
              </h3>
            </div>
            <button
              onClick={() => onNavigate('stock')}
              className="flex items-center gap-1 text-xs font-semibold text-[#0f5b43] hover:underline"
            >
              <span>Restock in Stock page</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#f2efe7]">
            {lowStockProducts.map((p) => (
              <div key={p.id} className="p-4 flex items-center justify-between hover:bg-[#faf9f6]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#f4f1e8] flex items-center justify-center text-[#0f5b43]">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#17211d] block">{p.name}</span>
                    <span className="text-[11px] font-mono text-[#747e78]">{p.sku} · {p.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-[#17211d] tabular-nums block">
                      {p.quantityInStock} in stock
                    </span>
                    <span className="text-[10px] text-[#747e78]">Reorder at {p.reorderLevel}</span>
                  </div>
                  <StatusBadge quantity={p.quantityInStock} reorderLevel={p.reorderLevel} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
