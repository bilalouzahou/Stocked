import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, ArrowUpDown, Filter, X, Download } from 'lucide-react';
import { Product } from '../types/inventory';
import { useInventory } from '../context/InventoryContext';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmModal } from '../components/ConfirmModal';
import { exportToCsv, getTodayDateString } from '../lib/csvExport';

interface ProductsViewProps {
  onOpenAddModal: () => void;
  onEditProduct: (product: Product) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  onOpenAddModal,
  onEditProduct,
}) => {
  const { products, deleteProduct, stats, categories } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Sorting
  const [sortField, setSortField] = useState<keyof Product>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search filter
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          p.name.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query);

        // Category filter
        const matchesCategory =
          selectedCategory === 'all' || p.category === selectedCategory;

        // Status filter
        let matchesStatus = true;
        if (selectedStatus === 'low') {
          matchesStatus = p.quantityInStock <= p.reorderLevel;
        } else if (selectedStatus === 'in_stock') {
          matchesStatus = p.quantityInStock > p.reorderLevel;
        } else if (selectedStatus === 'out_of_stock') {
          matchesStatus = p.quantityInStock === 0;
        }

        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = (valB as string).toLowerCase();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [products, searchQuery, selectedCategory, selectedStatus, sortField, sortOrder]);

  const toggleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleDeleteConfirm = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      setProductToDelete(null);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(val);
  };

  const getProductStatus = (p: Product) => {
    if (p.quantityInStock === 0) return 'Out of Stock';
    if (p.quantityInStock <= p.reorderLevel) return 'Low Stock';
    return 'In Stock';
  };

  const handleExportProductsCSV = () => {
    if (products.length === 0) return;
    const headers = [
      'Product Name',
      'SKU',
      'Category',
      'In Stock',
      'Unit Price',
      'Reorder Level',
      'Status',
    ];
    const rows = products.map((p) => [
      p.name,
      p.sku,
      p.category,
      p.quantityInStock,
      p.unitPrice.toFixed(2),
      p.reorderLevel,
      getProductStatus(p),
    ]);
    const filename = `inventory-products-${getTodayDateString()}.csv`;
    exportToCsv(filename, headers, rows);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#17211d]">Products</h1>
            <span className="px-2 py-0.5 text-xs font-mono font-medium rounded-full bg-[#e8e3d5] text-[#3e4842]">
              {stats.totalProducts}
            </span>
          </div>
          <p className="text-xs text-[#6e7771] mt-0.5">
            {stats.lowStockCount} items at or below reorder level
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportProductsCSV}
            disabled={products.length === 0}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#1f2924] bg-white border border-[#dbd5c6] hover:bg-[#faf8f3] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-2xs transition-colors"
            title={products.length === 0 ? 'No products available to export' : 'Export products to CSV'}
          >
            <Download className="w-3.5 h-3.5 text-[#0f5b43]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenAddModal}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0f5b43] hover:bg-[#0b4835] rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add product</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-3 border border-[#e5dfd2] shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8a948e] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name, SKU, or category..."
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

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1 text-xs text-[#717b75] shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </div>
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

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-[#faf8f4] border border-[#dcd6c7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f5b43]/30 text-[#17211d]"
          >
            <option value="all">All Statuses</option>
            <option value="in_stock">In Stock Only</option>
            <option value="low">Low Stock Only ({stats.lowStockCount})</option>
            <option value="out_of_stock">Out of Stock Only ({stats.outOfStockCount})</option>
          </select>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white rounded-xl border border-[#e5dfd2] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#ece7dc] bg-[#faf8f3] text-[11px] font-semibold text-[#6d7770] uppercase tracking-wider">
                <th
                  onClick={() => toggleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-[#17211d] select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Product</span>
                    <ArrowUpDown className="w-3 h-3 text-[#99a39d]" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('sku')}
                  className="py-3 px-4 cursor-pointer hover:text-[#17211d] select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>SKU</span>
                    <ArrowUpDown className="w-3 h-3 text-[#99a39d]" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('category')}
                  className="py-3 px-4 cursor-pointer hover:text-[#17211d] select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Category</span>
                    <ArrowUpDown className="w-3 h-3 text-[#99a39d]" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('quantityInStock')}
                  className="py-3 px-4 cursor-pointer hover:text-[#17211d] select-none text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>In Stock</span>
                    <ArrowUpDown className="w-3 h-3 text-[#99a39d]" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('unitPrice')}
                  className="py-3 px-4 cursor-pointer hover:text-[#17211d] select-none text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Unit Price</span>
                    <ArrowUpDown className="w-3 h-3 text-[#99a39d]" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('reorderLevel')}
                  className="py-3 px-4 cursor-pointer hover:text-[#17211d] select-none text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Reorder</span>
                    <ArrowUpDown className="w-3 h-3 text-[#99a39d]" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2efe7] text-xs">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#7c8680]">
                    No products found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-[#faf9f5] transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-semibold text-[#18231e]">
                      {p.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#6c7770]">
                      {p.sku}
                    </td>
                    <td className="py-3.5 px-4 text-[#4b5550]">
                      {p.category}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-right text-[#17211d] tabular-nums">
                      {p.quantityInStock}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-right text-[#343e39] tabular-nums">
                      {formatCurrency(p.unitPrice)}
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
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onEditProduct(p)}
                          className="px-2 py-1 text-xs font-medium text-[#4b5550] hover:text-[#0f5b43] hover:bg-[#edf5f1] rounded transition-colors"
                          title="Edit Product"
                        >
                          <span className="hidden sm:inline">Edit</span>
                          <Edit2 className="w-3.5 h-3.5 sm:hidden" />
                        </button>
                        <button
                          onClick={() => setProductToDelete(p)}
                          className="px-2 py-1 text-xs font-medium text-[#7c8680] hover:text-[#dc2626] hover:bg-[#fee2e2]/60 rounded transition-colors"
                          title="Delete Product"
                        >
                          <span className="hidden sm:inline">Delete</span>
                          <Trash2 className="w-3.5 h-3.5 sm:hidden" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(productToDelete)}
        title="Delete Product"
        message={`Are you sure you want to permanently delete "${productToDelete?.name}" (${productToDelete?.sku})? This action cannot be undone.`}
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
};
