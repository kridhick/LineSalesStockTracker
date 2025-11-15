// pages/CategoryMaster.tsx
import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { Category } from '../types';
import { dataService } from '../services/dataService';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { Table, TableColumn } from '../components/Table';
import { LoadingSpinner } from '../components/LoadingSpinner';
import useToast from '../hooks/useToast';

interface CategoryFormState {
  name: string;
}

const initialFormState: CategoryFormState = {
  name: '',
};

export const CategoryMaster: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentEditCategory, setCurrentEditCategory] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryFormState>(initialFormState);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const { addToast } = useToast();

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedCategories = await dataService.getCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      addToast('Failed to load categories.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!form.name.trim()) errors.name = 'Category name is required.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm({ ...form, [id]: value });
    setFormErrors({});
  };

  const openAddModal = () => {
    setCurrentEditCategory(null);
    setForm(initialFormState);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setCurrentEditCategory(category);
    setForm({ name: category.name });
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
      if (currentEditCategory) {
        await dataService.updateCategory(currentEditCategory.id, form);
        addToast('Category updated successfully!', 'success');
      } else {
        await dataService.addCategory(form);
        addToast('Category added successfully!', 'success');
      }
      await fetchCategories();
      closeModal();
    } catch (error: any) {
      console.error('Failed to save category:', error);
      addToast(error.message || `Failed to ${currentEditCategory ? 'update' : 'add'} category.`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure? Deleting this category will re-assign its items to "General Merchandise".')) {
      try {
        await dataService.deleteCategory(id);
        addToast('Category deleted successfully!', 'success');
        await fetchCategories();
      } catch (error: any) {
        console.error('Failed to delete category:', error);
        addToast(error.message || 'Failed to delete category.', 'error');
      }
    }
  };

  const columns: TableColumn<Category>[] = [
    { key: 'name', header: 'Category Name' },
    {
      key: 'actions',
      header: 'Actions',
      render: (category: Category) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={() => openEditModal(category)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(category.id)} disabled={category.name === 'General Merchandise'}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <div className="flex justify-center items-center h-full min-h-[60vh]"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-textPrimary">Category Master</h2>
        <Button onClick={openAddModal} variant="primary" className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Category
        </Button>
      </div>

      <Table<Category> data={categories} columns={columns} keyExtractor={(category) => category.id} emptyMessage="No categories found. Click 'Add Category' to get started!" />

      <Modal isOpen={isModalOpen} onClose={closeModal} title={currentEditCategory ? 'Edit Category' : 'Add New Category'}>
        <form onSubmit={handleSubmit}>
          <Input
            id="name"
            label="Category Name"
            value={form.name}
            onChange={handleInputChange}
            error={formErrors.name}
            placeholder="e.g., Electronics"
          />
          <div className="flex justify-end space-x-3 mt-6">
            <Button type="button" variant="ghost" onClick={closeModal} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSaving} disabled={isSaving}>
              {currentEditCategory ? 'Update Category' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};