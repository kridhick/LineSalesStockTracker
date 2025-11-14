// types.ts

export enum ItemCategory {
  ELECTRONICS = 'Electronics',
  ACCESSORIES = 'Accessories',
  CLOTHING = 'Clothing',
  FOOD = 'Food & Beverage',
  INDUSTRIAL = 'Industrial Supplies',
  GENERAL = 'General Merchandise',
}

export interface Item {
  id: string;
  name: string;
  description: string;
  sku: string;
  category: ItemCategory; // Changed from string to enum
  rate: number;
  openingStock: number;
  currentStock: number;
  lowStockThreshold?: number; // Optional field for low stock level
}

export interface Vehicle {
  id: string;
  name: string;
  licensePlate: string;
  capacity: number; // e.g., in units or kg
}

export enum TransactionType {
  STOCK_IN = 'STOCK_IN',
  STOCK_OUT = 'STOCK_OUT',
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  itemId: string;
  itemName: string; // For display convenience
  quantity: number;
  type: TransactionType;
  vehicleId?: string; // Optional for stock-in/out
  vehicleName?: string; // For display convenience
}

export interface DailyStockReportEntry {
  itemId: string;
  itemName: string;
  openingStock: number;
  stockIn: number;
  stockOut: number;
  closingStock: number;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export enum Page {
  DASHBOARD = 'DASHBOARD',
  ITEM_MASTER = 'ITEM_MASTER',
  VEHICLE_MASTER = 'VEHICLE_MASTER',
  STOCK_IN = 'STOCK_IN',
  STOCK_OUT = 'STOCK_OUT',
  REPORTS = 'REPORTS',
}

export interface NavigationItem {
  name: string;
  path: Page;
  icon: string; // Changed to string to hold SVG path data
}

// New interface for low stock alerts
export interface LowStockAlert {
  itemId: string;
  itemName: string;
  currentStock: number;
  lowStockThreshold: number;
}
