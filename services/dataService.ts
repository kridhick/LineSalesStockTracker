// services/dataService.ts
import { Item, Vehicle, Transaction, DailyStockReportEntry, Category, LowStockAlert, InventoryValuationEntry } from '../types';

// NOTE: This service has been refactored to simulate API calls.
// All localStorage logic has been removed. You will need to connect these
// methods to your backend API endpoints.

class DataService {
  constructor() {
    // The constructor is now empty as we no longer manage local state.
  }

  // --- MOCK API METHODS ---
  // In a real application, these would make fetch() requests to your backend.

  // Item Master CRUD
  async getItems(): Promise<Item[]> {
    console.warn("Mock API: getItems() called. Returning empty array. Connect to your backend.");
    return Promise.resolve([]);
  }

  async getItem(id: string): Promise<Item | undefined> {
    console.warn("Mock API: getItem() called. Returning undefined. Connect to your backend.", id);
    return Promise.resolve(undefined);
  }

  async addItem(item: Omit<Item, 'id' | 'currentStock'>): Promise<Item> {
    console.warn("Mock API: addItem() called. Returning mock data. Connect to your backend.", item);
    const newItem: Item = { id: `mock-${Date.now()}`, ...item, currentStock: item.openingStock };
    return Promise.resolve(newItem);
  }

  async updateItem(id: string, updatedFields: Partial<Item>): Promise<Item | null> {
    console.warn("Mock API: updateItem() called. Returning mock data. Connect to your backend.", id, updatedFields);
    return Promise.resolve(null); // Or mock a response
  }

  async deleteItem(id: string): Promise<boolean> {
    console.warn("Mock API: deleteItem() called. Returning true. Connect to your backend.", id);
    return Promise.resolve(true);
  }

  // Vehicle Master CRUD
  async getVehicles(): Promise<Vehicle[]> {
     console.warn("Mock API: getVehicles() called. Returning empty array. Connect to your backend.");
    return Promise.resolve([]);
  }
  
  async addVehicle(vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> {
    console.warn("Mock API: addVehicle() called. Returning mock data. Connect to your backend.", vehicle);
    const newVehicle: Vehicle = { id: `mock-${Date.now()}`, ...vehicle };
    return Promise.resolve(newVehicle);
  }

  async updateVehicle(id: string, updatedFields: Partial<Vehicle>): Promise<Vehicle | null> {
     console.warn("Mock API: updateVehicle() called. Returning mock data. Connect to your backend.", id, updatedFields);
    return Promise.resolve(null);
  }

  async deleteVehicle(id: string): Promise<boolean> {
     console.warn("Mock API: deleteVehicle() called. Returning true. Connect to your backend.", id);
    return Promise.resolve(true);
  }

  // Category Master CRUD
  async getCategories(): Promise<Category[]> {
    console.warn("Mock API: getCategories() called. Returning empty array. Connect to your backend.");
    return Promise.resolve([]);
  }

  async addCategory(category: Omit<Category, 'id'>): Promise<Category> {
    console.warn("Mock API: addCategory() called. Returning mock data. Connect to your backend.", category);
    const newCategory: Category = { id: `mock-${Date.now()}`, ...category };
    return Promise.resolve(newCategory);
  }

  async updateCategory(id: string, updatedFields: Partial<Category>): Promise<Category | null> {
    console.warn("Mock API: updateCategory() called. Returning mock data. Connect to your backend.", id, updatedFields);
    return Promise.resolve(null);
  }

  async deleteCategory(id: string): Promise<boolean> {
     console.warn("Mock API: deleteCategory() called. Returning true. Connect to your backend.", id);
    return Promise.resolve(true);
  }

  // Transaction Management
  async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction | null> {
    console.warn("Mock API: addTransaction() called. Returning mock data. Connect to your backend.", transaction);
     const newTransaction: Transaction = { id: `mock-${Date.now()}`, ...transaction };
    return Promise.resolve(newTransaction);
  }

  async getTransactions(date?: string): Promise<Transaction[]> {
    console.warn("Mock API: getTransactions() called. Returning empty array. Connect to your backend.", date);
    return Promise.resolve([]);
  }

  // Report Generation
  async getDailyStockReport(reportDate: string): Promise<DailyStockReportEntry[]> {
    console.warn("Mock API: getDailyStockReport() called. Returning empty array. Connect to your backend.", reportDate);
    return Promise.resolve([]);
  }

  async getStockSummary(): Promise<{ totalItems: number; totalVehicles: number; totalStockQuantity: number }> {
    console.warn("Mock API: getStockSummary() called. Returning zeros. Connect to your backend.");
    return Promise.resolve({ totalItems: 0, totalVehicles: 0, totalStockQuantity: 0 });
  }
  
  async getInventoryValuation(): Promise<InventoryValuationEntry[]> {
     console.warn("Mock API: getInventoryValuation() called. Returning empty array. Connect to your backend.");
    return Promise.resolve([]);
  }

  async getLowStockItems(): Promise<LowStockAlert[]> {
     console.warn("Mock API: getLowStockItems() called. Returning empty array. Connect to your backend.");
    return Promise.resolve([]);
  }

  // This function is now a no-op as data is managed by the backend.
  async seedData(): Promise<void> {
    console.log("seedData() is a no-op when using a backend database.");
    return Promise.resolve();
  }
}

export const dataService = new DataService();
