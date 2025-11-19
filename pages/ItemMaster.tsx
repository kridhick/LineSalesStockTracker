// pages/ItemMaster.tsx
import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { Item, Category } from '../types';
import { dataService } from '../services/dataService';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { Table } from '../components/Table';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Select } from '../components/Select';
import useToast from '../hooks/useToast';
import { TableColumn } from '../components/Table';

interface ItemFormState {
  name: string;
  description: string;
  sku: string;
  category: string;
  rate: number;
  openingStock: number;
  lowStockThreshold: number;
}

const initialFormState: ItemFormState = {
  name: '',
  description: '',
  sku: '',
  category: '',
  rate: 0,
  openingStock: 0,
  lowStockThreshold: 0,
};

export const ItemMaster: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState<Item | null>(null);
  const [form, setForm] = useState<ItemFormState>(initialFormState);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const { addToast } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedItems, fetchedCategories] = await Promise.all([
        dataService.getItems(),
        dataService.getCategories()
      ]);
      setItems(fetchedItems);
      setCategories(fetchedCategories);

      if (fetchedCategories.length > 0) {
        initialFormState.category = fetchedCategories[0].name;
      }
    } catch (error) {
      console.error('Failed to fetch items and categories:', error);
      addToast('Failed to load page data.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!form.name.trim()) errors.name = 'Item name is required.';
    if (!form.sku.trim()) errors.sku = 'SKU is required.';
    if (!form.description.trim()) errors.description = 'Description is required.';
    if (!form.category) errors.category = 'Category is required.';
    if (form.rate <= 0) errors.rate = 'Rate must be a positive number.';
    if (form.openingStock < 0) errors.openingStock = 'Opening stock cannot be negative.';
    if (form.lowStockThreshold < 0) errors.lowStockThreshold = 'Low stock threshold cannot be negative.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    
    let processedValue: string | number;
    if (e.target.nodeName === 'INPUT' && (e.target as HTMLInputElement).type === 'number') {
        processedValue = parseFloat(value) || 0;
    } else {
        processedValue = value;
    }

    setForm((prev) => ({ 
      ...prev, 
      [id]: processedValue
    }));
    setFormErrors((prev) => ({ ...prev, [id]: '' }));
  };

  const openAddModal = () => {
    setCurrentEditItem(null);
    setForm(initialFormState);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (item: Item) => {
    setCurrentEditItem(item);
    setForm({
      name: item.name,
      description: item.description,
      sku: item.sku,
      category: item.category,
      rate: item.rate,
      openingStock: item.openingStock,
      lowStockThreshold: item.lowStockThreshold || 0,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsSaving(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      if (currentEditItem) {
        await dataService.updateItem(currentEditItem.id, form);
        addToast('Item updated successfully!', 'success');
      } else {
        await dataService.addItem(form);
        addToast('Item added successfully!', 'success');
      }
      await fetchData();
      closeModal();
    } catch (error) {
      console.error('Failed to save item:', error);
      addToast(`Failed to ${currentEditItem ? 'update' : 'add'} item.`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item? This will also remove associated transactions.')) {
      try {
        await dataService.deleteItem(id);
        addToast('Item deleted successfully!', 'success');
        await fetchData();
      } catch (error) {
        console.error('Failed to delete item:', error);
        addToast('Failed to delete item.', 'error');
      }
    }
  };

  const categoryOptions = categories.map((cat) => ({ value: cat.name, label: cat.name }));

  const columns: TableColumn<Item>[] = [
    { key: 'name', header: 'Item Name' },
    { key: 'sku', header: 'SKU' },
    { key: 'category', header: 'Category' },
    { 
      key: 'rate', 
      header: 'Rate', 
      render: (item: Item) => `₹${item.rate.toFixed(2)}`
    },
    { key: 'openingStock', header: 'Opening Stock' },
    { key: 'currentStock', header: 'Current Stock', className: 'font-bold' },
    { key: 'lowStockThreshold', header: 'Threshold', render: (item: Item) => item.lowStockThreshold || 'N/A' },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Item) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={() => openEditModal(item)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(item.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-textPrimary dark:text-slate-200">Item Master</h2>
        <Button onClick={openAddModal} variant="primary" className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Item
        </Button>
      </div>

      <Table<Item> data={items} columns={columns} keyExtractor={(item) => item.id} emptyMessage="No items found. Click 'Add Item' to get started!" />

      <Modal isOpen={isModalOpen} onClose={closeModal} title={currentEditItem ? 'Edit Item' : 'Add New Item'}>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="name"
              label="Item Name"
              value={form.name}
              onChange={handleInputChange}
              error={formErrors.name}
              placeholder="e.g., Laptop Pro X"
            />
            <Input
              id="sku"
              label="SKU"
              value={form.sku}
              onChange={handleInputChange}
              error={formErrors.sku}
              placeholder="e.g., LAPX-001"
            />
             <Select
              id="category"
              label="Category"
              options={categoryOptions}
              value={form.category}
              onChange={handleInputChange}
              error={formErrors.category}
            />
            <Input
              id="rate"
              label="Rate (₹)"
              type="number"
              value={form.rate === 0 ? '' : form.rate}
              onChange={handleInputChange}
              error={formErrors.rate}
              placeholder="e.g., 99999.00"
              step="0.01"
              min="0.01"
            />
            <Input
              id="openingStock"
              label="Opening Stock"
              type="number"
              value={form.openingStock === 0 ? '' : form.openingStock}
              onChange={handleInputChange}
              error={formErrors.openingStock}
              placeholder="e.g., 50.5"
              min="0"
              step="0.01"
            />
             <Input
              id="lowStockThreshold"
              label="Low Stock Threshold"
              type="number"
              value={form.lowStockThreshold === 0 ? '' : form.lowStockThreshold}
              onChange={handleInputChange}
              error={formErrors.lowStockThreshold}
              placeholder="e.g., 10.5"
              min="0"
              step="0.01"
            />
          </div>
         
          <div className="mb-4 mt-4">
            <label htmlFor="description" className="block text-sm font-medium text-textSecondary dark:text-slate-400 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              className={`mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-slate-800 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white ${formErrors.description ? 'border-red-500' : ''}`}
              value={form.description}
              onChange={handleInputChange}
              placeholder="Detailed description of the item"
            ></textarea>
            {formErrors.description && <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button type="button" variant="ghost" onClick={closeModal} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSaving} disabled={isSaving}>
              {currentEditItem ? 'Update Item' : 'Create Item'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};