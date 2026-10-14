import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Product, ProductFormData, ProductSchema } from '../types/inventory';
import { useInventory } from '../context/InventoryContext';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
}) => {
  const { addProduct, updateProduct, categories } = useInventory();

  const isEditing = Boolean(productToEdit);

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    sku: '',
    category: categories[0] || 'Supplies',
    quantityInStock: 0,
    unitPrice: 0,
    reorderLevel: 5,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [customCategory, setCustomCategory] = useState(false);

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name,
        sku: productToEdit.sku,
        category: productToEdit.category,
        quantityInStock: productToEdit.quantityInStock,
        unitPrice: productToEdit.unitPrice,
        reorderLevel: productToEdit.reorderLevel,
      });
      setCustomCategory(!categories.includes(productToEdit.category));
    } else {
      setFormData({
        name: '',
        sku: '',
        category: categories[0] || 'Supplies',
        quantityInStock: 10,
        unitPrice: 19.99,
        reorderLevel: 5,
      });
      setCustomCategory(false);
    }
    setErrors({});
    setGeneralError(null);
  }, [productToEdit, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);

    // Validate using Zod
    const result = ProductSchema.safeParse({
      name: formData.name,
      sku: formData.sku.toUpperCase(),
      category: formData.category,
      quantityInStock: Number(formData.quantityInStock),
      unitPrice: Number(formData.unitPrice),
      reorderLevel: Number(formData.reorderLevel),
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    if (isEditing && productToEdit) {
      const res = updateProduct(productToEdit.id, result.data);
      if (!res.success) {
        setGeneralError(res.error || 'Failed to update product.');
        return;
      }
    } else {
      const res = addProduct(result.data);
      if (!res.success) {
        setGeneralError(res.error || 'Failed to add product.');
        return;
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div
        className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-[#e2ddd0] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eeeae0] bg-[#faf8f3]">
          <div>
            <h3 className="text-base font-semibold text-[#18231e]">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h3>
            <p className="text-xs text-[#6e7871] mt-0.5">
              {isEditing ? 'Update product parameters and reorder threshold.' : 'Add a new stock item to your catalog.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#7c8680] hover:text-[#18231e] hover:bg-[#ede8db] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {generalError && (
            <div className="flex items-center gap-2 p-3 text-xs text-[#991b1b] bg-[#fee2e2] border border-[#fca5a5] rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Product Name */}
          <div>
            <label className="block text-xs font-semibold text-[#323d37] mb-1">
              Product Name <span className="text-[#dc2626]">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Fellow Stagg EKG Kettle"
              className={`w-full px-3 py-2 text-sm bg-[#faf9f5] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f5b43]/30 transition-colors ${
                errors.name ? 'border-[#ef4444]' : 'border-[#dbd5c6]'
              }`}
            />
            {errors.name && <p className="text-[11px] text-[#dc2626] mt-1">{errors.name}</p>}
          </div>

          {/* SKU & Category Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#323d37] mb-1">
                SKU <span className="text-[#dc2626]">*</span>
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                placeholder="e.g. EQP-EKG-01"
                className={`w-full px-3 py-2 text-sm font-mono uppercase bg-[#faf9f5] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f5b43]/30 transition-colors ${
                  errors.sku ? 'border-[#ef4444]' : 'border-[#dbd5c6]'
                }`}
              />
              {errors.sku && <p className="text-[11px] text-[#dc2626] mt-1">{errors.sku}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#323d37]">
                  Category <span className="text-[#dc2626]">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setCustomCategory(!customCategory)}
                  className="text-[11px] text-[#0f5b43] hover:underline"
                >
                  {customCategory ? 'Choose from list' : '+ New category'}
                </button>
              </div>

              {customCategory ? (
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Roasting Supplies"
                  className={`w-full px-3 py-2 text-sm bg-[#faf9f5] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f5b43]/30 ${
                    errors.category ? 'border-[#ef4444]' : 'border-[#dbd5c6]'
                  }`}
                />
              ) : (
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-[#faf9f5] border border-[#dbd5c6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f5b43]/30"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  {!categories.includes(formData.category) && formData.category && (
                    <option value={formData.category}>{formData.category}</option>
                  )}
                </select>
              )}
              {errors.category && <p className="text-[11px] text-[#dc2626] mt-1">{errors.category}</p>}
            </div>
          </div>

          {/* Quantity, Unit Price, Reorder Level Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#323d37] mb-1">
                In Stock <span className="text-[#dc2626]">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.quantityInStock}
                onChange={(e) =>
                  setFormData({ ...formData, quantityInStock: parseInt(e.target.value) || 0 })
                }
                className={`w-full px-3 py-2 text-sm tabular-nums bg-[#faf9f5] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f5b43]/30 ${
                  errors.quantityInStock ? 'border-[#ef4444]' : 'border-[#dbd5c6]'
                }`}
              />
              {errors.quantityInStock && (
                <p className="text-[11px] text-[#dc2626] mt-1">{errors.quantityInStock}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#323d37] mb-1">
                Unit Price ($) <span className="text-[#dc2626]">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.unitPrice}
                onChange={(e) =>
                  setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })
                }
                className={`w-full px-3 py-2 text-sm tabular-nums bg-[#faf9f5] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f5b43]/30 ${
                  errors.unitPrice ? 'border-[#ef4444]' : 'border-[#dbd5c6]'
                }`}
              />
              {errors.unitPrice && (
                <p className="text-[11px] text-[#dc2626] mt-1">{errors.unitPrice}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#323d37] mb-1">
                Reorder Level <span className="text-[#dc2626]">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.reorderLevel}
                onChange={(e) =>
                  setFormData({ ...formData, reorderLevel: parseInt(e.target.value) || 0 })
                }
                className={`w-full px-3 py-2 text-sm tabular-nums bg-[#faf9f5] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f5b43]/30 ${
                  errors.reorderLevel ? 'border-[#ef4444]' : 'border-[#dbd5c6]'
                }`}
              />
              {errors.reorderLevel && (
                <p className="text-[11px] text-[#dc2626] mt-1">{errors.reorderLevel}</p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#eeeae0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#4b5550] bg-[#f2efe7] hover:bg-[#e6e2d6] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0f5b43] hover:bg-[#0b4835] rounded-lg shadow-xs transition-colors"
            >
              {isEditing ? 'Save changes' : 'Add product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
