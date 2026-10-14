import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Product, Movement, User, ProductFormData } from '../types/inventory';
import { INITIAL_PRODUCTS, DEMO_USER } from '../lib/seedData';

interface InventoryStats {
  totalProducts: number;
  totalStockValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  categoryUnits: Record<string, number>;
  totalStockUnits: number;
}

interface InventoryContextType {
  products: Product[];
  movements: Movement[];
  currentUser: User | null;
  stats: InventoryStats;
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  addProduct: (data: ProductFormData) => { success: boolean; error?: string };
  updateProduct: (id: string, data: ProductFormData) => { success: boolean; error?: string };
  deleteProduct: (id: string) => void;
  adjustStock: (productId: string, type: 'IN' | 'OUT', amount: number, note?: string) => { success: boolean; error?: string };
  resetToSampleData: () => void;
  categories: string[];
}

const STORAGE_KEYS = {
  PRODUCTS: 'ledger_inventory_products_v1',
  MOVEMENTS: 'ledger_inventory_movements_v1',
  USER: 'ledger_inventory_user_v1',
};

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Products state with localStorage
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback to initial
    }
    return INITIAL_PRODUCTS;
  });

  // Movements state with localStorage
  const [movements, setMovements] = useState<Movement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Fallback to empty
    }
    return [];
  });

  // User state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Default null
    }
    // Default logged in as admin to match instant review, or can be logged in by default
    return { username: DEMO_USER.username, name: DEMO_USER.name };
  });

  // Persist products
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products', e);
    }
  }, [products]);

  // Persist movements
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
    } catch (e) {
      console.error('Failed to save movements', e);
    }
  }, [movements]);

  // Persist user
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    } catch (e) {
      console.error('Failed to save user session', e);
    }
  }, [currentUser]);

  // Login handler
  const login = (username: string, password: string) => {
    if (username.trim() === DEMO_USER.username && password === DEMO_USER.password) {
      const user: User = { username: DEMO_USER.username, name: DEMO_USER.name };
      setCurrentUser(user);
      return { success: true };
    }
    return { success: false, error: 'Invalid username or password' };
  };

  // Logout handler
  const logout = () => {
    setCurrentUser(null);
  };

  // Add Product
  const addProduct = (data: ProductFormData) => {
    // Check SKU uniqueness
    const exists = products.some((p) => p.sku.toLowerCase() === data.sku.trim().toLowerCase());
    if (exists) {
      return { success: false, error: `A product with SKU "${data.sku}" already exists.` };
    }

    const now = new Date().toISOString();
    const newProduct: Product = {
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: data.name.trim(),
      sku: data.sku.trim().toUpperCase(),
      category: data.category.trim(),
      quantityInStock: data.quantityInStock,
      unitPrice: Number(data.unitPrice.toFixed(2)),
      reorderLevel: data.reorderLevel,
      createdAt: now,
      updatedAt: now,
    };

    setProducts((prev) => [newProduct, ...prev]);
    return { success: true };
  };

  // Update Product
  const updateProduct = (id: string, data: ProductFormData) => {
    // Check SKU uniqueness among other products
    const exists = products.some(
      (p) => p.id !== id && p.sku.toLowerCase() === data.sku.trim().toLowerCase()
    );
    if (exists) {
      return { success: false, error: `A product with SKU "${data.sku}" already exists.` };
    }

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            name: data.name.trim(),
            sku: data.sku.trim().toUpperCase(),
            category: data.category.trim(),
            quantityInStock: data.quantityInStock,
            unitPrice: Number(data.unitPrice.toFixed(2)),
            reorderLevel: data.reorderLevel,
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );
    return { success: true };
  };

  // Delete Product
  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Adjust Stock (Stock In / Stock Out)
  const adjustStock = (productId: string, type: 'IN' | 'OUT', amount: number, note?: string) => {
    if (amount <= 0 || !Number.isInteger(amount)) {
      return { success: false, error: 'Adjustment amount must be a positive whole number.' };
    }

    const targetProduct = products.find((p) => p.id === productId);
    if (!targetProduct) {
      return { success: false, error: 'Product not found.' };
    }

    const currentQty = targetProduct.quantityInStock;
    let newQty = currentQty;

    if (type === 'IN') {
      newQty = currentQty + amount;
    } else {
      if (currentQty < amount) {
        return {
          success: false,
          error: `Cannot stock out ${amount} units. Current stock is only ${currentQty}.`,
        };
      }
      newQty = currentQty - amount;
    }

    const now = new Date().toISOString();

    // Create movement audit entry
    const newMovement: Movement = {
      id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId: targetProduct.id,
      productName: targetProduct.name,
      productSku: targetProduct.sku,
      type,
      amount,
      resultingQuantity: newQty,
      timestamp: now,
      actor: currentUser?.username || 'admin',
      note,
    };

    // Update product stock
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, quantityInStock: newQty, updatedAt: now } : p))
    );

    // Prepend to movements
    setMovements((prev) => [newMovement, ...prev]);

    return { success: true };
  };

  // Reset to initial sample data
  const resetToSampleData = () => {
    setProducts(INITIAL_PRODUCTS);
    setMovements([]);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.MOVEMENTS);
  };

  // Compute stats
  const stats = useMemo<InventoryStats>(() => {
    let totalStockValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalStockUnits = 0;
    const categoryUnits: Record<string, number> = {};

    products.forEach((p) => {
      totalStockValue += p.quantityInStock * p.unitPrice;
      totalStockUnits += p.quantityInStock;

      if (p.quantityInStock <= p.reorderLevel) {
        lowStockCount++;
      }
      if (p.quantityInStock === 0) {
        outOfStockCount++;
      }

      const cat = p.category || 'Uncategorized';
      categoryUnits[cat] = (categoryUnits[cat] || 0) + p.quantityInStock;
    });

    return {
      totalProducts: products.length,
      totalStockValue,
      lowStockCount,
      outOfStockCount,
      categoryUnits,
      totalStockUnits,
    };
  }, [products]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  return (
    <InventoryContext.Provider
      value={{
        products,
        movements,
        currentUser,
        stats,
        login,
        logout,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        resetToSampleData,
        categories,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
