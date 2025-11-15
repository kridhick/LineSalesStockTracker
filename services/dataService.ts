// services/dataService.ts
import { Item, Vehicle, Transaction, DailyStockReportEntry, Category, LowStockAlert, InventoryValuationEntry, TransactionType } from '../types';

// In-memory database
let items: Item[] = [];
let vehicles: Vehicle[] = [];
let categories: Category[] = [];
let transactions: Transaction[] = [];
let seeded = false;

// Helper to simulate async operations
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

class DataService {

  // Item Master CRUD
  async getItems(): Promise<Item[]> {
    await delay(100);
    return JSON.parse(JSON.stringify(items));
  }

  async getItem(id: string): Promise<Item | undefined> {
    await delay(50);
    return JSON.parse(JSON.stringify(items.find(item => item.id === id)));
  }

  async addItem(item: Omit<Item, 'id' | 'currentStock'>): Promise<Item> {
    await delay(150);
    const newItem: Item = {
      id: crypto.randomUUID(),
      ...item,
      currentStock: item.openingStock
    };
    items.push(newItem);
    return JSON.parse(JSON.stringify(newItem));
  }

  async updateItem(id: string, updatedFields: Partial<Item>): Promise<Item | null> {
    await delay(150);
    const itemIndex = items.findIndex(item => item.id === id);
    if (itemIndex === -1) return null;
    items[itemIndex] = { ...items[itemIndex], ...updatedFields };
    return JSON.parse(JSON.stringify(items[itemIndex]));
  }

  async deleteItem(id: string): Promise<boolean> {
    await delay(200);
    items = items.filter(item => item.id !== id);
    transactions = transactions.filter(t => t.itemId !== id);
    return true;
  }

  // Vehicle Master CRUD
  async getVehicles(): Promise<Vehicle[]> {
    await delay(100);
    return JSON.parse(JSON.stringify(vehicles));
  }
  
  async addVehicle(vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> {
    await delay(150);
    const newVehicle: Vehicle = { id: crypto.randomUUID(), ...vehicle };
    vehicles.push(newVehicle);
    return JSON.parse(JSON.stringify(newVehicle));
  }

  async updateVehicle(id: string, updatedFields: Partial<Vehicle>): Promise<Vehicle | null> {
    await delay(150);
    const vehicleIndex = vehicles.findIndex(v => v.id === id);
    if (vehicleIndex === -1) return null;
    vehicles[vehicleIndex] = { ...vehicles[vehicleIndex], ...updatedFields };
    return JSON.parse(JSON.stringify(vehicles[vehicleIndex]));
  }

  async deleteVehicle(id: string): Promise<boolean> {
     await delay(200);
     vehicles = vehicles.filter(v => v.id !== id);
     return true;
  }

  // Category Master CRUD
  async getCategories(): Promise<Category[]> {
    await delay(100);
    return JSON.parse(JSON.stringify(categories));
  }

  async addCategory(category: Omit<Category, 'id'>): Promise<Category> {
    await delay(150);
    if (categories.some(c => c.name.toLowerCase() === category.name.toLowerCase())) {
        throw new Error(`Category "${category.name}" already exists.`);
    }
    const newCategory: Category = { id: crypto.randomUUID(), ...category };
    categories.push(newCategory);
    return JSON.parse(JSON.stringify(newCategory));
  }

  async updateCategory(id: string, updatedFields: Partial<Category>): Promise<Category | null> {
    await delay(150);
    const categoryIndex = categories.findIndex(c => c.id === id);
    if (categoryIndex === -1) return null;
    categories[categoryIndex] = { ...categories[categoryIndex], ...updatedFields };
    return JSON.parse(JSON.stringify(categories[categoryIndex]));
  }

  async deleteCategory(id: string): Promise<boolean> {
    await delay(200);
    const categoryToDelete = categories.find(c => c.id === id);
    if (!categoryToDelete || categoryToDelete.name === 'General Merchandise') {
      throw new Error("This category cannot be deleted.");
    }

    let generalCat = categories.find(c => c.name === 'General Merchandise');
    if (!generalCat) {
      generalCat = await this.addCategory({ name: 'General Merchandise' });
    }

    items.forEach(item => {
      if (item.category === categoryToDelete.name) {
        item.category = generalCat!.name;
      }
    });

    categories = categories.filter(c => c.id !== id);
    return true;
  }

  // Transaction Management
  async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction | null> {
    await delay(200);
    const item = items.find(i => i.id === transaction.itemId);
    if (!item) {
        throw new Error("Transaction failed: Item not found.");
    }
    
    if (transaction.type === TransactionType.STOCK_OUT && item.currentStock < transaction.quantity) {
        throw new Error(`Not enough stock for ${item.name}. Available: ${item.currentStock}`);
    }

    if (transaction.type === TransactionType.STOCK_IN) {
        item.currentStock += transaction.quantity;
    } else {
        item.currentStock -= transaction.quantity;
    }

    const newTransaction: Transaction = { id: crypto.randomUUID(), ...transaction };
    transactions.push(newTransaction);
    return JSON.parse(JSON.stringify(newTransaction));
  }

  async getTransactions(options?: { date?: string, limit?: number, orderBy?: { field: string, direction: 'asc' | 'desc' } }): Promise<Transaction[]> {
    await delay(100);
    let results = [...transactions];
    if (options?.date) {
      results = results.filter(t => t.date === options.date);
    }
    if (options?.orderBy) {
      results.sort((a, b) => {
        const field = options.orderBy!.field as keyof Transaction;
        if (a[field] < b[field]) return options.orderBy!.direction === 'asc' ? -1 : 1;
        if (a[field] > b[field]) return options.orderBy!.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    if (options?.limit) {
      results = results.slice(0, options.limit);
    }
    return JSON.parse(JSON.stringify(results));
  }

  // Report Generation
  async getDailyStockReport(reportDate: string): Promise<DailyStockReportEntry[]> {
    await delay(300);
    const allItems = await this.getItems();
    const transactionsToday = transactions.filter(t => t.date === reportDate);
    
    return allItems.map(item => {
        const stockIn = transactionsToday
            .filter(t => t.itemId === item.id && t.type === TransactionType.STOCK_IN)
            .reduce((sum, t) => sum + t.quantity, 0);

        const stockOut = transactionsToday
            .filter(t => t.itemId === item.id && t.type === TransactionType.STOCK_OUT)
            .reduce((sum, t) => sum + t.quantity, 0);

        const openingStock = item.currentStock - stockIn + stockOut;

        return {
            itemId: item.id,
            itemName: item.name,
            openingStock,
            stockIn,
            stockOut,
            closingStock: item.currentStock,
        };
    });
  }

  async getStockSummary(): Promise<{ totalItems: number; totalVehicles: number; totalStockQuantity: number }> {
    await delay(100);
    const totalStockQuantity = items.reduce((sum, item) => sum + item.currentStock, 0);
    return {
        totalItems: items.length,
        totalVehicles: vehicles.length,
        totalStockQuantity,
    };
  }
  
  async getInventoryValuation(): Promise<InventoryValuationEntry[]> {
    await delay(100);
    return items.map(item => ({
      itemId: item.id,
      itemName: item.name,
      category: item.category,
      currentStock: item.currentStock,
      rate: item.rate,
      totalValue: item.currentStock * item.rate,
    }));
  }

  async getLowStockItems(): Promise<LowStockAlert[]> {
    await delay(100);
    return items
      .filter(item => typeof item.lowStockThreshold === 'number' && item.currentStock < item.lowStockThreshold)
      .map(item => ({
        itemId: item.id,
        itemName: item.name,
        currentStock: item.currentStock,
        lowStockThreshold: item.lowStockThreshold!,
      }));
  }

  async seedData(): Promise<void> {
    if (seeded) {
      console.log("Data already seeded.");
      return;
    }

    console.log("Seeding initial data...");
    
    // Clear existing data
    items = [];
    vehicles = [];
    categories = [];
    transactions = [];

    // Seed Categories
    const electronics = await this.addCategory({ name: 'Electronics' });
    const office = await this.addCategory({ name: 'Office Supplies' });
    await this.addCategory({ name: 'General Merchandise' });

    // Seed Vehicles
    await this.addVehicle({ name: 'Delivery Van A', licensePlate: 'VAN-001', capacity: 500 });
    await this.addVehicle({ name: 'Supply Truck B', licensePlate: 'TRK-002', capacity: 2000 });

    // Seed Items
    await this.addItem({ name: 'Laptop Pro 15"', description: 'High-performance laptop', sku: 'LP15-001', category: electronics.name, rate: 1299.99, openingStock: 50, lowStockThreshold: 10 });
    await this.addItem({ name: 'Wireless Mouse', description: 'Ergonomic wireless mouse', sku: 'WM-002', category: electronics.name, rate: 25.50, openingStock: 200, lowStockThreshold: 25 });
    await this.addItem({ name: 'A4 Paper Ream', description: '500 sheets of A4 paper', sku: 'A4-001', category: office.name, rate: 5.00, openingStock: 500, lowStockThreshold: 50 });
    
    seeded = true;
  }
}

export const dataService = new DataService();