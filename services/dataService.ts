// services/dataService.ts
import { supabase } from './supabase';
import { Item, Vehicle, Transaction, DailyStockReportEntry, Category, LowStockAlert, InventoryValuationEntry, TransactionType } from '../types';

// Helper to handle Supabase errors
const handleSupabaseError = (error: any, context: string) => {
  if (error) {
    console.error(`Supabase error in ${context}:`, error);
    throw new Error(`A database error occurred: ${error.message}`);
  }
};

class DataService {

  // Item Master CRUD
  async getItems(): Promise<Item[]> {
    const { data, error } = await supabase.from('items').select('*').order('name');
    handleSupabaseError(error, 'getItems');
    return data || [];
  }

  async getItem(id: string): Promise<Item | undefined> {
    const { data, error } = await supabase.from('items').select('*').eq('id', id).single();
    handleSupabaseError(error, 'getItem');
    return data;
  }

  async addItem(item: Omit<Item, 'id' | 'currentStock'>): Promise<Item> {
    const { data, error } = await supabase
      .from('items')
      .insert({ ...item, currentStock: item.openingStock })
      .select()
      .single();
    handleSupabaseError(error, 'addItem');
    return data;
  }

  async updateItem(id: string, updatedFields: Partial<Item>): Promise<Item | null> {
    const { data, error } = await supabase
      .from('items')
      .update(updatedFields)
      .eq('id', id)
      .select()
      .single();
    handleSupabaseError(error, 'updateItem');
    return data;
  }

  async deleteItem(id: string): Promise<boolean> {
    const { error } = await supabase.from('items').delete().eq('id', id);
    handleSupabaseError(error, 'deleteItem');
    return !error;
  }

  // Vehicle Master CRUD
  async getVehicles(): Promise<Vehicle[]> {
    const { data, error } = await supabase.from('vehicles').select('*').order('name');
    handleSupabaseError(error, 'getVehicles');
    return data || [];
  }
  
  async addVehicle(vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> {
    const { data, error } = await supabase.from('vehicles').insert(vehicle).select().single();
    handleSupabaseError(error, 'addVehicle');
    return data;
  }

  async updateVehicle(id: string, updatedFields: Partial<Vehicle>): Promise<Vehicle | null> {
    const { data, error } = await supabase.from('vehicles').update(updatedFields).eq('id', id).select().single();
    handleSupabaseError(error, 'updateVehicle');
    return data;
  }

  async deleteVehicle(id: string): Promise<boolean> {
     const { error } = await supabase.from('vehicles').delete().eq('id', id);
     handleSupabaseError(error, 'deleteVehicle');
     return !error;
  }

  // Category Master CRUD
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase.from('categories').select('*').order('name');
    handleSupabaseError(error, 'getCategories');
    return data || [];
  }

  async addCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const { data, error } = await supabase.from('categories').insert(category).select().single();
    if (error?.code === '23505') { // Handle unique constraint violation
        throw new Error(`Category "${category.name}" already exists.`);
    }
    handleSupabaseError(error, 'addCategory');
    return data;
  }

  async updateCategory(id: string, updatedFields: Partial<Category>): Promise<Category | null> {
    const { data, error } = await supabase.from('categories').update(updatedFields).eq('id', id).select().single();
    handleSupabaseError(error, 'updateCategory');
    return data;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const { data: categoryToDelete, error: fetchError } = await supabase.from('categories').select('name').eq('id', id).single();
    handleSupabaseError(fetchError, 'deleteCategory (fetch)');

    if (!categoryToDelete || categoryToDelete.name === 'General Merchandise') {
      throw new Error("This category cannot be deleted.");
    }
    
    // Update items to General Merchandise category
    const { error: updateError } = await supabase.from('items').update({ category: 'General Merchandise' }).eq('category', categoryToDelete.name);
    handleSupabaseError(updateError, 'deleteCategory (update items)');

    // Delete the category
    const { error: deleteError } = await supabase.from('categories').delete().eq('id', id);
    handleSupabaseError(deleteError, 'deleteCategory (delete)');

    return !deleteError;
  }

  // Transaction Management
  async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction | null> {
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('id, currentStock, name')
      .eq('id', transaction.itemId)
      .single();
    
    handleSupabaseError(itemError, 'addTransaction (fetch item)');
    if (!item) {
      throw new Error("Transaction failed: Item not found.");
    }

    let newStock = item.currentStock;
    if (transaction.type === TransactionType.STOCK_IN) {
      newStock += transaction.quantity;
    } else {
      if (item.currentStock < transaction.quantity) {
        throw new Error(`Not enough stock for ${item.name}. Available: ${item.currentStock}`);
      }
      newStock -= transaction.quantity;
    }

    // NOTE: These two operations should ideally be in a database transaction.
    // For simplicity, we are executing them sequentially.
    const { error: updateError } = await supabase
      .from('items')
      .update({ currentStock: newStock })
      .eq('id', transaction.itemId);
    handleSupabaseError(updateError, 'addTransaction (update stock)');

    const { data: newTransaction, error: insertError } = await supabase
      .from('transactions')
      .insert(transaction)
      .select()
      .single();
    handleSupabaseError(insertError, 'addTransaction (insert transaction)');
    
    return newTransaction;
  }

  async getTransactions(options?: { date?: string, limit?: number, orderBy?: { field: string, direction: 'asc' | 'desc' } }): Promise<Transaction[]> {
    let query = supabase.from('transactions').select('*');

    if (options?.date) {
      query = query.eq('date', options.date);
    }
    if (options?.orderBy) {
      query = query.order(options.orderBy.field as any, { ascending: options.orderBy.direction === 'asc' });
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    handleSupabaseError(error, 'getTransactions');
    return data || [];
  }

  // Report Generation
  async getDailyStockReport(reportDate: string): Promise<DailyStockReportEntry[]> {
    // FIX: The getItems method returns an array of items directly, not an object with data and error properties. Error handling is already managed within the getItems method.
    const allItems = await this.getItems();

    const { data: transactionsToday, error: transError } = await supabase
      .from('transactions')
      .select('*')
      .eq('date', reportDate);
    handleSupabaseError(transError, 'getDailyStockReport (fetch transactions)');
    
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
    const { count: totalItems, error: itemsError } = await supabase.from('items').select('*', { count: 'exact', head: true });
    handleSupabaseError(itemsError, 'getStockSummary (count items)');
    
    const { count: totalVehicles, error: vehiclesError } = await supabase.from('vehicles').select('*', { count: 'exact', head: true });
    handleSupabaseError(vehiclesError, 'getStockSummary (count vehicles)');

    const { data: stockData, error: stockError } = await supabase.from('items').select('currentStock');
    handleSupabaseError(stockError, 'getStockSummary (fetch stock)');
    
    const totalStockQuantity = stockData?.reduce((sum, item) => sum + item.currentStock, 0) ?? 0;

    return {
        totalItems: totalItems ?? 0,
        totalVehicles: totalVehicles ?? 0,
        totalStockQuantity,
    };
  }
  
  async getInventoryValuation(): Promise<InventoryValuationEntry[]> {
    // FIX: The getItems method returns an array of items directly, not an object with data and error properties. Error handling is already managed within the getItems method.
    const items = await this.getItems();
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
    const { data, error } = await supabase.from('items').select('*').filter('lowStockThreshold', 'isnot', null);
    handleSupabaseError(error, 'getLowStockItems');

    return (data || [])
      .filter(item => item.currentStock < item.lowStockThreshold)
      .map(item => ({
        itemId: item.id,
        itemName: item.name,
        currentStock: item.currentStock,
        lowStockThreshold: item.lowStockThreshold!,
      }));
  }

  async seedData(): Promise<void> {
    const { count, error } = await supabase.from('items').select('*', { count: 'exact', head: true });
    handleSupabaseError(error, 'seedData (check)');
    if (count !== null && count > 0) {
      console.log("Data already exists. Skipping seed.");
      return;
    }

    console.log("Seeding initial data into Supabase...");

    // Seed Categories
    const { data: categories, error: catError } = await supabase.from('categories').insert([
        { name: 'Electronics' },
        { name: 'Office Supplies' },
    ]).select();
    handleSupabaseError(catError, 'seedData (categories)');

    // Seed Vehicles
    const { error: vehicleError } = await supabase.from('vehicles').insert([
      { name: 'Delivery Van A', licensePlate: 'VAN-001', capacity: 500 },
      { name: 'Supply Truck B', licensePlate: 'TRK-002', capacity: 2000 },
    ]);
    handleSupabaseError(vehicleError, 'seedData (vehicles)');

    // Seed Items
    if (categories) {
        const electronics = categories.find(c => c.name === 'Electronics');
        const office = categories.find(c => c.name === 'Office Supplies');

        const { error: itemError } = await supabase.from('items').insert([
          { name: 'Laptop Pro 15"', description: 'High-performance laptop', sku: 'LP15-001', category: electronics?.name, rate: 1299.99, openingStock: 50, currentStock: 50, lowStockThreshold: 10 },
          { name: 'Wireless Mouse', description: 'Ergonomic wireless mouse', sku: 'WM-002', category: electronics?.name, rate: 25.50, openingStock: 200, currentStock: 200, lowStockThreshold: 25 },
          { name: 'A4 Paper Ream', description: '500 sheets of A4 paper', sku: 'A4-001', category: office?.name, rate: 5.00, openingStock: 500, currentStock: 500, lowStockThreshold: 50 },
        ]);
        handleSupabaseError(itemError, 'seedData (items)');
    }
  }
}

export const dataService = new DataService();