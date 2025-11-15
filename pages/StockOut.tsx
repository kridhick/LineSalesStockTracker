// pages/StockOut.tsx
import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { Item, Vehicle, TransactionType } from '../types';
import { dataService } from '../services/dataService';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { LoadingSpinner } from '../components/LoadingSpinner';
import useToast from '../hooks/useToast';
import { formatDate } from '../utils/dateUtils';

// Represents an item added to the current transaction list
interface TransactionItem {
  itemId: string;
  itemName: string;
  quantity: number;
}

// State for the item entry form section
interface CurrentItemState {
  itemId: string;
  quantity: number;
}

const initialCurrentItemState: CurrentItemState = {
  itemId: '',
  quantity: 0,
};

export const StockOut: React.FC = () => {
  const [transactionDetails, setTransactionDetails] = useState({
    date: formatDate(new Date()),
    vehicleId: '',
  });
  const [currentItem, setCurrentItem] = useState<CurrentItemState>(initialCurrentItemState);
  const [transactionItems, setTransactionItems] = useState<TransactionItem[]>([]);

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [items, setItems] = useState<Item[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedItems = await dataService.getItems();
      const fetchedVehicles = await dataService.getVehicles();
      setItems(fetchedItems);
      setVehicles(fetchedVehicles);

      if (fetchedItems.length > 0) {
        setCurrentItem(prev => ({ ...prev, itemId: fetchedItems[0].id }));
      }
      if (fetchedVehicles.length > 0) {
        setTransactionDetails(prev => ({ ...prev, vehicleId: fetchedVehicles[0].id }));
      }

    } catch (error) {
      console.error('Failed to fetch data for stock out:', error);
      addToast('Failed to load necessary data.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDetailChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setTransactionDetails(prev => ({ ...prev, [id]: value }));
  };

  const handleCurrentItemChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setCurrentItem(prev => ({
      ...prev,
      [id]: id === 'quantity' ? parseInt(value, 10) || 0 : value,
    }));
    setFormErrors(prev => ({ ...prev, quantity: '', itemId: '' })); // Clear errors on change
  };

  const handleAddItemToList = () => {
    const errors: { [key: string]: string } = {};
    const selectedItem = items.find(item => item.id === currentItem.itemId);

    if (!currentItem.itemId) errors.itemId = 'Please select an item.';
    if (currentItem.quantity <= 0) errors.quantity = 'Quantity must be positive.';
    if (transactionItems.some(item => item.itemId === currentItem.itemId)) {
      errors.itemId = 'Item already in list. Remove it to change quantity.';
    }
    if (selectedItem && currentItem.quantity > selectedItem.currentStock) {
      errors.quantity = `Not enough stock. Available: ${selectedItem.currentStock}.`;
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    if (!selectedItem) return;

    setTransactionItems(prev => [...prev, {
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      quantity: currentItem.quantity,
    }]);

    setCurrentItem({ ...initialCurrentItemState, itemId: items[0]?.id || '' });
  };

  const handleRemoveItem = (itemId: string) => {
    setTransactionItems(prev => prev.filter(item => item.itemId !== itemId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (transactionItems.length === 0) {
      addToast('Please add at least one item to the transaction.', 'error');
      return;
    }
     if (!transactionDetails.date || !transactionDetails.vehicleId) {
      addToast('Please ensure transaction date and vehicle are selected.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedVehicle = vehicles.find(v => v.id === transactionDetails.vehicleId);
      if (!selectedVehicle) throw new Error("Vehicle not found");

      const transactionPromises = transactionItems.map(tItem =>
        dataService.addTransaction({
          date: transactionDetails.date,
          itemId: tItem.itemId,
          itemName: tItem.itemName,
          quantity: tItem.quantity,
          type: TransactionType.STOCK_OUT,
          vehicleId: selectedVehicle.id,
          vehicleName: selectedVehicle.name,
        })
      );

      await Promise.all(transactionPromises);
      addToast(`${transactionItems.length} stock out transaction(s) recorded successfully!`, 'success');

      // Check for low stock alerts on all affected items
      const uniqueItemIds = [...new Set(transactionItems.map(item => item.itemId))];
      for (const itemId of uniqueItemIds) {
          const updatedItem = await dataService.getItem(itemId);
          if (updatedItem && typeof updatedItem.lowStockThreshold === 'number' && updatedItem.currentStock < updatedItem.lowStockThreshold) {
              addToast(`Low stock warning for ${updatedItem.name}! Stock is now ${updatedItem.currentStock}.`, 'error');
          }
      }

      setTransactionItems([]);
      setCurrentItem({ ...initialCurrentItemState, itemId: items[0]?.id || '' });
      setTransactionDetails(prev => ({ ...prev, date: formatDate(new Date()) }));
      await fetchData();
    } catch (error) {
      console.error('Failed to record stock out transaction:', error);
      // Fix: Display the specific error message from the caught error by checking if it's an instance of Error.
      if (error instanceof Error) {
        addToast(error.message || 'Failed to record one or more transactions.', 'error');
      } else {
        addToast('Failed to record one or more transactions.', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full min-h-[60vh]"><LoadingSpinner size="lg" /></div>;
  }

  if (items.length === 0 || vehicles.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-lg mx-auto bg-card dark:bg-slate-800 rounded-lg shadow-md mt-10 text-center">
        <h2 className="text-2xl font-bold text-textPrimary dark:text-slate-200 mb-4">Stock Out Transaction</h2>
        <p className="text-textSecondary dark:text-slate-400">You must have at least one item and one vehicle to record transactions.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold text-textPrimary dark:text-slate-200 mb-6 text-center">Stock Out Transaction</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="bg-card dark:bg-slate-800 p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2 dark:border-slate-700">Transaction Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="date" label="Transaction Date" type="date" value={transactionDetails.date} onChange={handleDetailChange} />
            <Select id="vehicleId" label="Select Vehicle" options={vehicles.map(v => ({ value: v.id, label: v.name }))} value={transactionDetails.vehicleId} onChange={handleDetailChange} />
          </div>
        </div>

        <div className="bg-card dark:bg-slate-800 p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2 dark:border-slate-700">Add Item to Transaction</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div className="md:col-span-2">
              <Select id="itemId" label="Select Item" options={items.map(i => ({ value: i.id, label: `${i.name} (Stock: ${i.currentStock})` }))} value={currentItem.itemId} onChange={handleCurrentItemChange} error={formErrors.itemId} />
            </div>
            <div>
              <Input id="quantity" label="Quantity" type="number" min="1" value={currentItem.quantity === 0 ? '' : currentItem.quantity} onChange={handleCurrentItemChange} error={formErrors.quantity} />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button type="button" variant="secondary" onClick={handleAddItemToList}>Add Item to List</Button>
          </div>
        </div>
        
        <div className="bg-card dark:bg-slate-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2 dark:border-slate-700">Items in this Transaction</h3>
           {transactionItems.length === 0 ? (
            <p className="text-textSecondary dark:text-slate-400 text-center py-4">No items have been added to this transaction yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-textSecondary dark:text-slate-400 uppercase">Item Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-textSecondary dark:text-slate-400 uppercase">Quantity</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-textSecondary dark:text-slate-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                  {transactionItems.map(item => (
                    <tr key={item.itemId}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-textPrimary dark:text-slate-300">{item.itemName}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-textPrimary dark:text-slate-300">{item.quantity}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <Button type="button" variant="danger" size="sm" onClick={() => handleRemoveItem(item.itemId)}>Remove</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex justify-end mt-6 border-t pt-4 dark:border-slate-700">
            <Button type="submit" variant="danger" isLoading={isSubmitting} disabled={isSubmitting || transactionItems.length === 0}>
              Record {transactionItems.length > 0 ? `${transactionItems.length} Item(s)` : ''} Stock Out
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};