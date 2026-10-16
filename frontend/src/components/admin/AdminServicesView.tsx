import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Clock, Check, DollarSign } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/index.js';
import {
  createServiceAdmin,
  updateServiceAdmin,
  deleteServiceAdmin,
} from '../../store/adminSlice.js';
import { showErrorToast, showSuccessToast } from '../../store/toastSlice.js';
import { ImageUploadBox } from '../common/ImageUploadBox.js';
import { ConfirmModal } from '../common/ConfirmModal.js';
import type { Service } from '../../types/index.js';

export const AdminServicesView: React.FC = () => {
  const dispatch = useAppDispatch();
  const { services, isLoadingServices } = useAppSelector((state) => state.admin);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteServiceId, setDeleteServiceId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Hair');
  const [duration, setDuration] = useState(45);
  const [price, setPrice] = useState(50);
  const [currency, setCurrency] = useState('CAD');
  const [image, setImage] = useState('');

  const openCreateModal = () => {
    setEditingService(null);
    setName('');
    setDescription('');
    setCategory('Hair');
    setDuration(45);
    setPrice(50);
    setCurrency('CAD');
    setImage('');
    setIsModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setName(service.name);
    setDescription(service.description);
    setCategory(service.category);
    setDuration(service.duration);
    setPrice(service.price);
    setCurrency(service.currency || 'CAD');
    setImage(service.imageUrl || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingService) {
        await dispatch(
          updateServiceAdmin({
            id: editingService._id || (editingService.id as string),
            payload: { name, description, category, duration, price, currency, imageUrl: image },
          })
        ).unwrap();
        dispatch(showSuccessToast('Service updated successfully!'));
      } else {
        await dispatch(
          createServiceAdmin({
            name,
            description,
            category,
            duration,
            price,
            currency,
            imageUrl: image,
            isActive: true,
          })
        ).unwrap();
        dispatch(showSuccessToast('Service created successfully!'));
      }
      setIsModalOpen(false);
    } catch (err: any) {
      const errorMsg = typeof err === 'string' ? err : err?.message || 'Failed to save service';
      dispatch(showErrorToast(errorMsg, 'Error'));
    }
  };

  const confirmDelete = async () => {
    if (!deleteServiceId) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteServiceAdmin(deleteServiceId)).unwrap();
      dispatch(showSuccessToast('Service deleted successfully!'));
      setDeleteServiceId(null);
    } catch (err: any) {
      dispatch(showErrorToast(err?.message || 'Failed to delete service'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (service: Service) => {
    const id = service._id || (service.id as string);
    try {
      await dispatch(
        updateServiceAdmin({
          id,
          payload: { isActive: !service.isActive },
        })
      ).unwrap();
      dispatch(
        showSuccessToast(
          `Service marked as ${!service.isActive ? 'Active' : 'Inactive'}`
        )
      );
    } catch (err: any) {
      dispatch(showErrorToast(err?.message || 'Failed to update service status'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Services Catalog</h2>
          <p className="text-xs text-gray-500">Configure salon treatments, pricing, and timing</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      </div>

      {isLoadingServices ? (
        <div className="py-12 text-center text-sm text-gray-400">Loading services...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <div
              key={service._id || service.id}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs flex flex-col justify-between hover:border-gray-200 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                    {service.category}
                  </span>
                  <button
                    onClick={() => handleToggleActive(service)}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      service.isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {service.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>

                <h3 className="text-base font-bold text-gray-900 mt-2">{service.name}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{service.description}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{service.duration} mins</span>
                  </div>
                  <span className="text-base font-extrabold text-gray-900">
                    ${service.price} {service.currency || 'CAD'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(service)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteServiceId(service._id || (service.id as string))}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in duration-150">
            <h3 className="font-bold text-gray-900 text-base mb-4">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Service Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Hair">Hair</option>
                  <option value="Color">Color</option>
                  <option value="Facial">Facial</option>
                  <option value="Spa">Spa</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Duration (minutes) *</label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    required
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Price (CAD) *</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <ImageUploadBox
                label="Service Image (Upload or Image URL)"
                value={image}
                onChange={setImage}
                folder="bookease_services"
                placeholder="https://... or click Upload Image"
              />

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(deleteServiceId)}
        title="Delete Service?"
        message="Are you sure you want to delete this service from the salon catalog? Any future bookings for this service might be affected."
        confirmLabel="Delete Service"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onClose={() => setDeleteServiceId(null)}
      />
    </div>
  );
};
