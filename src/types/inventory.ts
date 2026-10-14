import { z } from 'zod';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantityInStock: number;
  unitPrice: number;
  reorderLevel: number;
  createdAt: string;
  updatedAt: string;
}

export interface Movement {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  type: 'IN' | 'OUT';
  amount: number;
  resultingQuantity: number;
  timestamp: string;
  actor: string;
  note?: string;
}

export interface User {
  username: string;
  name: string;
}

export const ProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  sku: z.string().min(3, 'SKU must be at least 3 characters').regex(/^[A-Z0-9-]+$/i, 'SKU should only contain letters, numbers, and hyphens'),
  category: z.string().min(2, 'Category is required'),
  quantityInStock: z.number().int('Quantity must be an integer').min(0, 'Quantity cannot be negative'),
  unitPrice: z.number().min(0, 'Unit price cannot be negative'),
  reorderLevel: z.number().int('Reorder level must be an integer').min(0, 'Reorder level cannot be negative'),
});

export type ProductFormData = z.infer<typeof ProductSchema>;

export const StockAdjustmentSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  type: z.enum(['IN', 'OUT']),
  amount: z.number().int().positive('Amount must be greater than 0'),
  note: z.string().optional(),
});

export const LoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof LoginSchema>;

export type ActivePage = 'dashboard' | 'products' | 'stock' | 'movements' | 'settings';
