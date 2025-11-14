// services/dataService.ts

import { Item, Vehicle, Transaction, TransactionType, DailyStockReportEntry, ItemCategory, LowStockAlert } from '../types';
import { formatDate, parseDate, getPreviousDay } from '../utils/dateUtils';

interface DataStore {
  items: Map<string, Item>;
  vehicles: Map<string, Vehicle>;
  transactions: Transaction[];
}

const STORAGE_KEY = 'inventoryFlowTrackerData';

class DataService {
  private dataStore: DataStore;

  constructor() {
    this.dataStore = this.loadData();
  }

  private loadData(): DataStore {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      return {
        items: new Map(parsedData.items),
        vehicles: new Map(parsedData.vehicles),
        transactions: parsedData.transactions,
      };
    }
    return {
      items: new Map(),
      vehicles: new Map(),
      transactions: [],
    };
  }

  private saveData(): void {
    const dataToStore = {
      items: Array.from(this.dataStore.items.entries()),
      vehicles: Array.from(this.dataStore.vehicles.entries()),
      transactions: this.dataStore.transactions,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
  }

  // Helper to generate a unique ID
  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  // Item Master CRUD
  async getItems(): Promise<Item[]> {
    return Array.from(this.dataStore.items.values());
  }

  async getItem(id: string): Promise<Item | undefined> {
    return this.dataStore.items.get(id);
  }

  async addItem(item: Omit<Item, 'id' | 'currentStock'>): Promise<Item> {
    const newItem: Item = { id: this.generateId(), ...item, currentStock: item.openingStock };
    this.dataStore.items.set(newItem.id, newItem);
    this.saveData();
    return newItem;
  }

  async updateItem(id: string, updatedFields: Partial<Item>): Promise<Item | null> {
    const existingItem = this.dataStore.items.get(id);
    if (existingItem) {
      const originalOpeningStock = existingItem.openingStock;
      const updatedItem = { ...existingItem, ...updatedFields };
  
      // If openingStock has changed, recalculate currentStock based on the difference
      if (updatedFields.openingStock !== undefined && updatedFields.openingStock !== originalOpeningStock) {
          const openingStockDifference = updatedFields.openingStock - originalOpeningStock;
          updatedItem.currentStock = existingItem.currentStock + openingStockDifference;
      }
  
      this.dataStore.items.set(id, updatedItem);
      this.saveData();
      return updatedItem;
    }
    return null;
  }

  async deleteItem(id: string): Promise<boolean> {
    const deleted = this.dataStore.items.delete(id);
    if (deleted) {
      // Also remove any transactions related to this item for data consistency (optional, but good practice for mock)
      this.dataStore.transactions = this.dataStore.transactions.filter(t => t.itemId !== id);
      this.saveData();
    }
    return deleted;
  }

  // Vehicle Master CRUD
  async getVehicles(): Promise<Vehicle[]> {
    return Array.from(this.dataStore.vehicles.values());
  }

  async getVehicle(id: string): Promise<Vehicle | undefined> {
    return this.dataStore.vehicles.get(id);
  }

  async addVehicle(vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> {
    const newVehicle: Vehicle = { id: this.generateId(), ...vehicle };
    this.dataStore.vehicles.set(newVehicle.id, newVehicle);
    this.saveData();
    return newVehicle;
  }

  async updateVehicle(id: string, updatedFields: Partial<Vehicle>): Promise<Vehicle | null> {
    const existingVehicle = this.dataStore.vehicles.get(id);
    if (existingVehicle) {
      const updatedVehicle = { ...existingVehicle, ...updatedFields };
      this.dataStore.vehicles.set(id, updatedVehicle);
      this.saveData();
      return updatedVehicle;
    }
    return null;
  }

  async deleteVehicle(id: string): Promise<boolean> {
    const deleted = this.dataStore.vehicles.delete(id);
    if (deleted) {
      // Remove transactions related to this vehicle
      this.dataStore.transactions = this.dataStore.transactions.filter(t => t.vehicleId !== id);
      this.saveData();
    }
    return deleted;
  }

  // Transaction Management
  async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction | null> {
    const item = this.dataStore.items.get(transaction.itemId);
    if (!item) {
      console.error('Item not found for transaction:', transaction.itemId);
      return null;
    }

    const newTransaction: Transaction = { id: this.generateId(), ...transaction };

    // Update current stock directly for simplicity
    if (newTransaction.type === TransactionType.STOCK_IN) {
      item.currentStock += newTransaction.quantity;
    } else { // STOCK_OUT
      if (item.currentStock < newTransaction.quantity) {
        console.error('Insufficient stock for transaction:', transaction.itemId);
        return null;
      }
      item.currentStock -= newTransaction.quantity;
    }
    this.dataStore.items.set(item.id, { ...item }); // Ensure React state updates if item object reference changes

    this.dataStore.transactions.push(newTransaction);
    this.dataStore.transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    this.saveData();
    return newTransaction;
  }

  async getTransactions(date?: string): Promise<Transaction[]> {
    if (date) {
      return this.dataStore.transactions.filter(t => t.date === date);
    }
    return this.dataStore.transactions;
  }

  // Report Generation
  async getDailyStockReport(reportDate: string): Promise<DailyStockReportEntry[]> {
    const today = parseDate(reportDate);
    const yesterday = getPreviousDay(today);
    const yesterdayFormatted = formatDate(yesterday);

    const allItems = await this.getItems();
    const itemsMap = new Map(allItems.map(item => [item.id, item]));

    const dailyReport: DailyStockReportEntry[] = [];

    // Calculate opening stock for the report date (which is closing stock of the previous day)
    const previousDayReport = await this.getCalculatedClosingStockUpToDate(yesterdayFormatted);

    for (const item of allItems) {
      const openingStock = previousDayReport.get(item.id) || 0;

      let stockIn = 0;
      let stockOut = 0;

      // Filter transactions for the report date
      const transactionsOnDay = this.dataStore.transactions.filter(
        t => t.date === reportDate && t.itemId === item.id
      );

      for (const transaction of transactionsOnDay) {
        if (transaction.type === TransactionType.STOCK_IN) {
          stockIn += transaction.quantity;
        } else if (transaction.type === TransactionType.STOCK_OUT) {
          stockOut += transaction.quantity;
        }
      }

      const closingStock = openingStock + stockIn - stockOut;

      dailyReport.push({
        itemId: item.id,
        itemName: item.name,
        openingStock,
        stockIn,
        stockOut,
        closingStock,
      });
    }

    return dailyReport;
  }

  /**
   * Calculates the theoretical closing stock for each item up to a specific date (inclusive).
   * This is used to determine the "opening stock" for the subsequent day.
   */
  private async getCalculatedClosingStockUpToDate(dateString: string): Promise<Map<string, number>> {
    const calculatedStocks = new Map<string, number>();
    const allItems = await this.getItems();
    allItems.forEach(item => calculatedStocks.set(item.id, item.openingStock)); // Initialize with item's base opening stock

    // Filter all transactions that happened on or before the given date
    const relevantTransactions = this.dataStore.transactions.filter(
      t => new Date(t.date).getTime() <= parseDate(dateString).getTime()
    );

    for (const transaction of relevantTransactions) {
      const currentStock = calculatedStocks.get(transaction.itemId) || 0;
      if (transaction.type === TransactionType.STOCK_IN) {
        calculatedStocks.set(transaction.itemId, currentStock + transaction.quantity);
      } else { // STOCK_OUT
        calculatedStocks.set(transaction.itemId, currentStock - transaction.quantity);
      }
    }
    return calculatedStocks;
  }

  /**
   * Gets the current overall stock summary for the dashboard.
   */
  async getStockSummary(): Promise<{ totalItems: number; totalVehicles: number; totalStockQuantity: number }> {
    const items = await this.getItems();
    const vehicles = await this.getVehicles();
    const totalStockQuantity = items.reduce((sum, item) => sum + item.currentStock, 0);

    return {
      totalItems: items.length,
      totalVehicles: vehicles.length,
      totalStockQuantity,
    };
  }

  /**
   * Gets items that are below their low stock threshold.
   */
  async getLowStockItems(): Promise<LowStockAlert[]> {
    const items = await this.getItems();
    const alerts: LowStockAlert[] = [];
    for (const item of items) {
      if (typeof item.lowStockThreshold === 'number' && item.lowStockThreshold > 0 && item.currentStock < item.lowStockThreshold) {
        alerts.push({
          itemId: item.id,
          itemName: item.name,
          currentStock: item.currentStock,
          lowStockThreshold: item.lowStockThreshold,
        });
      }
    }
    return alerts;
  }

  // Seed initial data for demonstration
  async seedData(): Promise<void> {
    if (this.dataStore.items.size === 0 && this.dataStore.vehicles.size === 0 && this.dataStore.transactions.length === 0) {
      console.log('Seeding initial data...');
      const item1: Item = { id: this.generateId(), name: 'Laptop Pro X', description: 'High-performance laptop', sku: 'LAPX-001', category: ItemCategory.ELECTRONICS, rate: 1200, openingStock: 10, currentStock: 10, lowStockThreshold: 5 };
      const item2: Item = { id: this.generateId(), name: 'Wireless Mouse', description: 'Ergonomic wireless mouse', sku: 'MOU-002', category: ItemCategory.ACCESSORIES, rate: 25, openingStock: 50, currentStock: 50, lowStockThreshold: 10 };
      const item3: Item = { id: this.generateId(), name: 'USB-C Hub', description: '7-in-1 USB-C Hub', sku: 'HUB-003', category: ItemCategory.ACCESSORIES, rate: 45, openingStock: 30, currentStock: 30, lowStockThreshold: 15 };

      this.dataStore.items.set(item1.id, item1);
      this.dataStore.items.set(item2.id, item2);
      this.dataStore.items.set(item3.id, item3);

      const vehicle1: Vehicle = { id: this.generateId(), name: 'Van Alpha', licensePlate: 'ABC-123', capacity: 500 };
      const vehicle2: Vehicle = { id: this.generateId(), name: 'Truck Beta', licensePlate: 'XYZ-789', capacity: 2000 };

      this.dataStore.vehicles.set(vehicle1.id, vehicle1);
      this.dataStore.vehicles.set(vehicle2.id, vehicle2);

      const today = formatDate(new Date());
      const yesterday = formatDate(getPreviousDay(new Date()));

      // Initial stock-in for Laptop Pro X (yesterday) - This will be added to the opening stock of 10
      await this.addTransaction({
        date: yesterday,
        itemId: item1.id,
        itemName: item1.name,
        quantity: 10,
        type: TransactionType.STOCK_IN,
        vehicleId: vehicle1.id,
        vehicleName: vehicle1.name,
      });

      // Stock-in for Wireless Mouse (today)
      await this.addTransaction({
        date: today,
        itemId: item2.id,
        itemName: item2.name,
        quantity: 20,
        type: TransactionType.STOCK_IN,
        vehicleId: vehicle1.id,
        vehicleName: vehicle1.name,
      });

      // Stock-out for Laptop Pro X (today)
      await this.addTransaction({
        date: today,
        itemId: item1.id,
        itemName: item1.name,
        quantity: 3,
        type: TransactionType.STOCK_OUT,
        vehicleId: vehicle2.id,
        vehicleName: vehicle2.name,
      });

       // Another stock-in for USB-C Hub (today)
       await this.addTransaction({
        date: today,
        itemId: item3.id,
        itemName: item3.name,
        quantity: 15,
        type: TransactionType.STOCK_IN,
        vehicleId: vehicle1.id,
        vehicleName: vehicle1.name,
      });

      this.saveData();
      console.log('Initial data seeded successfully.');
    } else {
      console.log('Data already exists, skipping seeding.');
    }
  }
}

export const dataService = new DataService();
