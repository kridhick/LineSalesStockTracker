// services/dataService.ts
import { Item, Vehicle, Transaction, DailyStockReportEntry, Category, LowStockAlert, InventoryValuationEntry, TransactionType } from '../types';
import { db } from './firebase';
// FIX: Using scoped package import for firebase/firestore to resolve module export errors.
import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  runTransaction,
  writeBatch,
  documentId,
  getCountFromServer,
  QueryDocumentSnapshot,
  DocumentData,
  orderBy,
  limit,
} from '@firebase/firestore';
import { formatDate, getPreviousDay } from '../utils/dateUtils';

// Helper to convert Firestore doc to our typed object
const fromFirestore = <T>(doc: QueryDocumentSnapshot<DocumentData>): T => {
    const data = doc.data();
    return { id: doc.id, ...data } as T;
};

class DataService {

  // Item Master CRUD
  async getItems(): Promise<Item[]> {
    const itemsCol = collection(db, 'items');
    const itemSnapshot = await getDocs(itemsCol);
    return itemSnapshot.docs.map(doc => fromFirestore<Item>(doc));
  }

  async getItem(id: string): Promise<Item | undefined> {
    const itemDocRef = doc(db, 'items', id);
    const itemSnap = await getDoc(itemDocRef);
    return itemSnap.exists() ? fromFirestore<Item>(itemSnap) : undefined;
  }

  async addItem(item: Omit<Item, 'id' | 'currentStock'>): Promise<Item> {
    const newItemData = { ...item, currentStock: item.openingStock };
    const docRef = await addDoc(collection(db, 'items'), newItemData);
    return { id: docRef.id, ...newItemData };
  }

  async updateItem(id: string, updatedFields: Partial<Item>): Promise<Item | null> {
    const itemDoc = doc(db, 'items', id);
    await updateDoc(itemDoc, updatedFields);
    const updatedSnap = await getDoc(itemDoc);
    return updatedSnap.exists() ? fromFirestore<Item>(updatedSnap) : null;
  }

  async deleteItem(id: string): Promise<boolean> {
    const batch = writeBatch(db);
    // Delete the item
    const itemDoc = doc(db, 'items', id);
    batch.delete(itemDoc);
    // Delete associated transactions
    const transQuery = query(collection(db, 'transactions'), where('itemId', '==', id));
    const transSnapshot = await getDocs(transQuery);
    transSnapshot.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    return true;
  }

  // Vehicle Master CRUD
  async getVehicles(): Promise<Vehicle[]> {
    const vehiclesCol = collection(db, 'vehicles');
    const vehicleSnapshot = await getDocs(vehiclesCol);
    return vehicleSnapshot.docs.map(doc => fromFirestore<Vehicle>(doc));
  }
  
  async addVehicle(vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> {
    const docRef = await addDoc(collection(db, 'vehicles'), vehicle);
    return { id: docRef.id, ...vehicle };
  }

  async updateVehicle(id: string, updatedFields: Partial<Vehicle>): Promise<Vehicle | null> {
    const vehicleDoc = doc(db, 'vehicles', id);
    await updateDoc(vehicleDoc, updatedFields);
    const updatedSnap = await getDoc(vehicleDoc);
    return updatedSnap.exists() ? fromFirestore<Vehicle>(updatedSnap) : null;
  }

  async deleteVehicle(id: string): Promise<boolean> {
     await deleteDoc(doc(db, 'vehicles', id));
     return true;
  }

  // Category Master CRUD
  async getCategories(): Promise<Category[]> {
    const categoriesCol = collection(db, 'categories');
    const categorySnapshot = await getDocs(categoriesCol);
    return categorySnapshot.docs.map(doc => fromFirestore<Category>(doc));
  }

  async addCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const q = query(collection(db, 'categories'), where("name", "==", category.name));
    const existing = await getDocs(q);
    if (!existing.empty) {
      throw new Error(`Category "${category.name}" already exists.`);
    }
    const docRef = await addDoc(collection(db, 'categories'), category);
    return { id: docRef.id, ...category };
  }

  async updateCategory(id: string, updatedFields: Partial<Category>): Promise<Category | null> {
    const categoryDoc = doc(db, 'categories', id);
    await updateDoc(categoryDoc, updatedFields);
    const updatedSnap = await getDoc(categoryDoc);
    return updatedSnap.exists() ? fromFirestore<Category>(updatedSnap) : null;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const categoryToDelete = await getDoc(doc(db, 'categories', id));
    if (!categoryToDelete.exists() || categoryToDelete.data().name === 'General Merchandise') {
      throw new Error("This category cannot be deleted.");
    }

    // Ensure 'General Merchandise' category exists
    let generalCatId = '';
    const q = query(collection(db, 'categories'), where("name", "==", "General Merchandise"));
    const generalCatSnap = await getDocs(q);
    if (generalCatSnap.empty) {
        const newCat = await this.addCategory({name: 'General Merchandise'});
        generalCatId = newCat.id;
    } else {
        generalCatId = generalCatSnap.docs[0].id;
    }
    const generalCatName = "General Merchandise";

    // Reassign items
    const batch = writeBatch(db);
    const itemsToUpdateQuery = query(collection(db, 'items'), where('category', '==', categoryToDelete.data().name));
    const itemsSnapshot = await getDocs(itemsToUpdateQuery);
    itemsSnapshot.forEach(itemDoc => {
      batch.update(itemDoc.ref, { category: generalCatName });
    });

    // Delete category
    batch.delete(doc(db, 'categories', id));
    
    await batch.commit();
    return true;
  }

  // Transaction Management
  async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction | null> {
    try {
      const newTransaction = await runTransaction(db, async (t) => {
        const itemRef = doc(db, 'items', transaction.itemId);
        const itemSnap = await t.get(itemRef);

        if (!itemSnap.exists()) {
          throw new Error("Transaction failed: Item not found.");
        }
        
        const itemData = itemSnap.data() as Item;
        let newStock = itemData.currentStock;

        if (transaction.type === TransactionType.STOCK_IN) {
          newStock += transaction.quantity;
        } else { // STOCK_OUT
          if (itemData.currentStock < transaction.quantity) {
            throw new Error(`Not enough stock for ${itemData.name}. Available: ${itemData.currentStock}`);
          }
          newStock -= transaction.quantity;
        }

        t.update(itemRef, { currentStock: newStock });
        
        const transDocRef = doc(collection(db, 'transactions'));
        const fullTransaction: Transaction = { id: transDocRef.id, ...transaction };
        t.set(transDocRef, transaction);

        return fullTransaction;
      });
      return newTransaction;
    } catch (error) {
      console.error("Transaction failed: ", error);
      throw error; // Re-throw to be caught by UI
    }
  }

  async getTransactions(options?: { date?: string, limit?: number, orderBy?: { field: string, direction: 'asc' | 'desc' } }): Promise<Transaction[]> {
    let transQuery = query(collection(db, 'transactions'));
    if (options?.date) {
      transQuery = query(transQuery, where('date', '==', options.date));
    }
    if (options?.orderBy) {
      transQuery = query(transQuery, orderBy(options.orderBy.field, options.orderBy.direction));
    }
    if (options?.limit) {
      transQuery = query(transQuery, limit(options.limit));
    }
    const transSnapshot = await getDocs(transQuery);
    return transSnapshot.docs.map(doc => fromFirestore<Transaction>(doc));
  }

  // Report Generation
  async getDailyStockReport(reportDate: string): Promise<DailyStockReportEntry[]> {
    const allItems = await this.getItems();
    const transactionsToday = await this.getTransactions({ date: reportDate });

    const reportMap = new Map<string, DailyStockReportEntry>();

    allItems.forEach(item => {
      reportMap.set(item.id, {
        itemId: item.id,
        itemName: item.name,
        openingStock: 0, // Will be calculated later
        stockIn: 0,
        stockOut: 0,
        closingStock: item.currentStock,
      });
    });

    transactionsToday.forEach(t => {
      const entry = reportMap.get(t.itemId);
      if (entry) {
        if (t.type === TransactionType.STOCK_IN) {
          entry.stockIn += t.quantity;
        } else {
          entry.stockOut += t.quantity;
        }
      }
    });

    // Calculate opening stock: Opening = Closing - IN + OUT
    reportMap.forEach(entry => {
      entry.openingStock = entry.closingStock - entry.stockIn + entry.stockOut;
    });

    return Array.from(reportMap.values());
  }

  async getStockSummary(): Promise<{ totalItems: number; totalVehicles: number; totalStockQuantity: number }> {
    const itemsSnapshot = await getDocs(collection(db, 'items'));
    const vehiclesSnapshot = await getDocs(collection(db, 'vehicles'));

    const totalItems = itemsSnapshot.size;
    const totalVehicles = vehiclesSnapshot.size;
    const totalStockQuantity = itemsSnapshot.docs
      .reduce((sum, doc) => sum + (doc.data().currentStock || 0), 0);
      
    return { totalItems, totalVehicles, totalStockQuantity };
  }
  
  async getInventoryValuation(): Promise<InventoryValuationEntry[]> {
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
    const items = await this.getItems();
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
    const itemsCount = (await getCountFromServer(collection(db, 'items'))).data().count;
    if (itemsCount > 0) {
      console.log("Data already exists. Skipping seed.");
      return;
    }

    console.log("Seeding initial data...");
    
    // Seed Categories
    const electronics = await this.addCategory({ name: 'Electronics' });
    const office = await this.addCategory({ name: 'Office Supplies' });
    await this.addCategory({ name: 'General Merchandise' });

    // Seed Vehicles
    const vanA = await this.addVehicle({ name: 'Delivery Van A', licensePlate: 'VAN-001', capacity: 500 });
    const truckB = await this.addVehicle({ name: 'Supply Truck B', licensePlate: 'TRK-002', capacity: 2000 });

    // Seed Items
    await this.addItem({ name: 'Laptop Pro 15"', description: 'High-performance laptop', sku: 'LP15-001', category: electronics.name, rate: 1299.99, openingStock: 50, lowStockThreshold: 10 });
    await this.addItem({ name: 'Wireless Mouse', description: 'Ergonomic wireless mouse', sku: 'WM-002', category: electronics.name, rate: 25.50, openingStock: 200, lowStockThreshold: 25 });
    await this.addItem({ name: 'A4 Paper Ream', description: '500 sheets of A4 paper', sku: 'A4-001', category: office.name, rate: 5.00, openingStock: 500, lowStockThreshold: 50 });
  }
}

export const dataService = new DataService();