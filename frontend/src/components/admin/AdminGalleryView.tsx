import React, { useEffect, useState } from 'react';
import { Image, Plus, Trash2, RefreshCw, X, Sparkles, ExternalLink } from 'lucide-react';
import { galleryApi, type GalleryItem } from '../../api/gallery.api.js';
import { useAppDispatch } from '../../store/index.js';
import { showErrorToast, showSuccessToast } from '../../store/toastSlice.js';
import { ImageUploadBox } from '../common/ImageUploadBox.js';
import { ConfirmModal } from '../common/ConfirmModal.js';

export const AdminGalleryView: React.FC = () => {
  const dispatch = useAppDispatch();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Hair');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchGallery = async () => {
    setIsLoading(true);
    try {
      const data = await galleryApi.getGallery();
      setItems(data);
    } catch (err: any) {
      dispatch(showErrorToast(err.message || 'Failed to load gallery items from database'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleOpenModal = () => {
    setTitle('');
    setCategory('Hair');
    setImage('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !image.trim()) {
      dispatch(showErrorToast('Title and Image URL are required', 'Validation Error'));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await galleryApi.createGalleryItem({
        title: title.trim(),
        category: category.trim(),
        image: image.trim(),
        description: description.trim(),
      });
      dispatch(showSuccessToast(res.message || 'Image added successfully to gallery!'));
      setItems((prev) => [res.item, ...prev]);
      setIsModalOpen(false);
    } catch (err: any) {
      dispatch(showErrorToast(err.message || 'Failed to add image to gallery'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await galleryApi.deleteGalleryItem(itemToDelete.id);
      dispatch(showSuccessToast(`Image "${itemToDelete.title}" deleted successfully`));
      setItems((prev) => prev.filter((i) => i._id !== itemToDelete.id));
      setItemToDelete(null);
    } catch (err: any) {
      dispatch(showErrorToast(err.message || 'Failed to delete gallery item'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Image className="w-5 h-5 text-blue-600" />
            Salon Gallery Showcase
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Add and manage portfolio photos shown to clients on the homepage gallery. Stored dynamically in MongoDB.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchGallery}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleOpenModal}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-blue-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Image
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      {isLoading && items.length === 0 ? (
        <div className="py-16 text-center text-xs text-gray-400">Loading gallery photos...</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-2xs">
          <Image className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-700">No gallery images found</p>
          <p className="text-xs text-gray-400 mt-1">Click "Add Image" above to upload your first photo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item._id}
              className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="h-52 relative overflow-hidden bg-gray-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>

                <div className="p-4 space-y-1.5">
                  <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{item.title}</h3>
                  {item.description && (
                    <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
                  )}
                </div>
              </div>

              <div className="p-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <a
                  href={item.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-medium"
                >
                  <ExternalLink className="w-3 h-3" />
                  View Original
                </a>
                <button
                  onClick={() => setItemToDelete({ id: item._id, title: item.title })}
                  className="px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Image Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 via-white to-indigo-50 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Add New Gallery Image
                </h3>
                <p className="text-xs text-gray-500">Add a stunning photo to the client showcase</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Title / Look Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. French Balayage & Silk Finish"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Hair">Hair Styling & Color</option>
                  <option value="Facial">Facial & Skin Care</option>
                  <option value="Spa">Spa & Body Massage</option>
                  <option value="Bridal">Bridal & Glamour</option>
                  <option value="Nails">Nail Couture</option>
                </select>
              </div>

              <ImageUploadBox
                label="Gallery Image (Upload to Cloudinary or URL)"
                value={image}
                onChange={setImage}
                required
                folder="bookease_gallery"
              />

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Dimensional blonde tones paired with silk smooth blowout..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-bold shadow-sm"
                >
                  {isSubmitting ? 'Saving...' : 'Add Image'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(itemToDelete)}
        title="Delete Gallery Image?"
        message={`Are you sure you want to delete "${itemToDelete?.title}" from the salon showcase? This will remove it from the homepage gallery.`}
        confirmLabel="Delete Image"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onClose={() => setItemToDelete(null)}
      />
    </div>
  );
};
