// pages/VehicleMaster.tsx
import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { Vehicle } from '../types';
import { dataService } from '../services/dataService';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { Table } from '../components/Table';
import { LoadingSpinner } from '../components/LoadingSpinner';
import useToast from '../hooks/useToast';
import { TableColumn } from '../components/Table'; // Import TableColumn

interface VehicleFormState {
  name: string;
  licensePlate: string;
  capacity: number;
}

const initialFormState: VehicleFormState = {
  name: '',
  licensePlate: '',
  capacity: 0,
};

export const VehicleMaster: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentEditVehicle, setCurrentEditVehicle] = useState<Vehicle | null>(null);
  const [form, setForm] = useState<VehicleFormState>(initialFormState);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const { addToast } = useToast();

  const fetchVehicles = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedVehicles = await dataService.getVehicles();
      setVehicles(fetchedVehicles);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
      addToast('Failed to load vehicles.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!form.name.trim()) errors.name = 'Vehicle name is required.';
    if (!form.licensePlate.trim()) errors.licensePlate = 'License plate is required.';
    if (form.capacity <= 0) errors.capacity = 'Capacity must be a positive number.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [id]: id === 'capacity' ? parseInt(value, 10) || 0 : value,
    }));
    setFormErrors((prev) => ({ ...prev, [id]: '' })); // Clear error on change
  };

  const openAddModal = () => {
    setCurrentEditVehicle(null);
    setForm(initialFormState);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (vehicle: Vehicle) => {
    setCurrentEditVehicle(vehicle);
    setForm({
      name: vehicle.name,
      licensePlate: vehicle.licensePlate,
      capacity: vehicle.capacity,
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
      if (currentEditVehicle) {
        await dataService.updateVehicle(currentEditVehicle.id, form);
        addToast('Vehicle updated successfully!', 'success');
      } else {
        await dataService.addVehicle(form);
        addToast('Vehicle added successfully!', 'success');
      }
      await fetchVehicles(); // Refresh vehicles list
      closeModal();
    } catch (error) {
      console.error('Failed to save vehicle:', error);
      addToast(`Failed to ${currentEditVehicle ? 'update' : 'add'} vehicle.`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this vehicle? This will also remove associated transactions.')) {
      try {
        await dataService.deleteVehicle(id);
        addToast('Vehicle deleted successfully!', 'success');
        await fetchVehicles(); // Refresh vehicles list
      } catch (error) {
        console.error('Failed to delete vehicle:', error);
        addToast('Failed to delete vehicle.', 'error');
      }
    }
  };

  // Fix: Explicitly define the type of the columns array
  const columns: TableColumn<Vehicle>[] = [
    { key: 'name', header: 'Vehicle Name' },
    { key: 'licensePlate', header: 'License Plate' },
    { key: 'capacity', header: 'Capacity (units)' },
    {
      key: 'actions',
      header: 'Actions',
      render: (vehicle: Vehicle) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={() => openEditModal(vehicle)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(vehicle.id)}>
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
        <h2 className="text-2xl sm:text-3xl font-bold text-textPrimary">Vehicle Master</h2>
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
          Add Vehicle
        </Button>
      </div>

      <Table<Vehicle> data={vehicles} columns={columns} keyExtractor={(vehicle) => vehicle.id} emptyMessage="No vehicles found. Click 'Add Vehicle' to get started!" />

      <Modal isOpen={isModalOpen} onClose={closeModal} title={currentEditVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}>
        <form onSubmit={handleSubmit}>
          <Input
            id="name"
            label="Vehicle Name"
            value={form.name}
            onChange={handleInputChange}
            error={formErrors.name}
            placeholder="e.g., Van Alpha"
          />
          <Input
            id="licensePlate"
            label="License Plate"
            value={form.licensePlate}
            onChange={handleInputChange}
            error={formErrors.licensePlate}
            placeholder="e.g., ABC-123"
          />
          <Input
            id="capacity"
            label="Capacity (units)"
            type="number"
            value={form.capacity === 0 ? '' : form.capacity}
            onChange={handleInputChange}
            error={formErrors.capacity}
            placeholder="e.g., 500"
            min="1"
          />

          <div className="flex justify-end space-x-3 mt-6">
            <Button type="button" variant="ghost" onClick={closeModal} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSaving} disabled={isSaving}>
              {currentEditVehicle ? 'Update Vehicle' : 'Create Vehicle'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};