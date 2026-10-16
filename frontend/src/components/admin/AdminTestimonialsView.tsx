import React, { useEffect, useState } from 'react';
import { MessageSquareQuote, Plus, Star, Trash2, RefreshCw, X, Sparkles, User } from 'lucide-react';
import { testimonialApi, type TestimonialItem } from '../../api/testimonial.api.js';
import { useAppDispatch } from '../../store/index.js';
import { showErrorToast, showSuccessToast } from '../../store/toastSlice.js';
import { ImageUploadBox } from '../common/ImageUploadBox.js';
import { ConfirmModal } from '../common/ConfirmModal.js';

export const AdminTestimonialsView: React.FC = () => {
  const dispatch = useAppDispatch();
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [service, setService] = useState('French Balayage & Silk Finish');
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTestimonials = async () => {
    setIsLoading(true);
    try {
      const data = await testimonialApi.getAllTestimonialsAdmin();
      setTestimonials(data);
    } catch (err: any) {
      dispatch(showErrorToast(err.message || 'Failed to load testimonials from database'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleOpenModal = () => {
    setName('');
    setService('French Balayage & Silk Finish');
    setRating('5');
    setComment('');
    setAvatar('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      dispatch(showErrorToast('Client Name and Review Comment are required', 'Validation Error'));
      return;
    }

    if (/[0-9]/.test(name)) {
      dispatch(showErrorToast('Numbers are not allowed in Client Name', 'Validation Error'));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await testimonialApi.createTestimonial({
        name: name.trim(),
        service: service.trim(),
        rating: parseInt(rating, 10) || 5,
        comment: comment.trim(),
        avatar: avatar.trim(),
      });
      dispatch(showSuccessToast(res.message || 'Testimonial added successfully!'));
      setTestimonials((prev) => [res.testimonial, ...prev]);
      setIsModalOpen(false);
    } catch (err: any) {
      dispatch(showErrorToast(err.message || 'Failed to add testimonial'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!reviewToDelete) return;
    setIsDeleting(true);
    try {
      await testimonialApi.deleteTestimonial(reviewToDelete.id);
      dispatch(showSuccessToast(`Review from "${reviewToDelete.name}" deleted successfully`));
      setTestimonials((prev) => prev.filter((t) => t._id !== reviewToDelete.id));
      setReviewToDelete(null);
    } catch (err: any) {
      dispatch(showErrorToast(err.message || 'Failed to delete testimonial'));
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
            <MessageSquareQuote className="w-5 h-5 text-blue-600" />
            Client Reviews & Testimonials
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage client testimonials displayed in the luxury reviews section on the homepage. Stored in MongoDB.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTestimonials}
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
            Add Testimonial
          </button>
        </div>
      </div>

      {/* Testimonials List */}
      {isLoading && testimonials.length === 0 ? (
        <div className="py-16 text-center text-xs text-gray-400">Loading client testimonials...</div>
      ) : testimonials.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-2xs">
          <MessageSquareQuote className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-700">No testimonials found</p>
          <p className="text-xs text-gray-400 mt-1">Click "Add Testimonial" above to post client praise.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t._id}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={`w-3.5 h-3.5 ${
                          idx < t.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    {t.service}
                  </span>
                </div>

                <p className="text-xs text-gray-700 italic leading-relaxed">
                  "{t.comment}"
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {t.avatar ? (
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                      {t.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">{t.name}</h4>
                    <span className="text-[10px] text-emerald-600 font-semibold">Verified Client</span>
                  </div>
                </div>

                <button
                  onClick={() => setReviewToDelete({ id: t._id, name: t.name })}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete review"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 via-white to-indigo-50 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Add Client Testimonial
                </h3>
                <p className="text-xs text-gray-500">Post positive customer feedback to the website</p>
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
                  Client Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onKeyDown={(e) => {
                    if (/^[0-9]$/.test(e.key)) {
                      e.preventDefault();
                      dispatch(showErrorToast('Numbers are not allowed in Client Name'));
                    }
                  }}
                  onChange={(e) => setName(e.target.value.replace(/[0-9]/g, ''))}
                  placeholder="Sophie Tremblay (Letters only)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Service Experience <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    placeholder="e.g. French Balayage"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Rating (Stars) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                    <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                    <option value="3">⭐⭐⭐ (3 Stars)</option>
                  </select>
                </div>
              </div>

              <ImageUploadBox
                label="Client Avatar Photo (Upload to Cloudinary or URL)"
                value={avatar}
                onChange={setAvatar}
                folder="bookease_avatars"
                placeholder="https://res.cloudinary.com/... or upload photo"
              />

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Review Comment <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="The French Balayage transformed my hair completely! Pure luxury..."
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
                  {isSubmitting ? 'Saving...' : 'Add Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(reviewToDelete)}
        title="Delete Testimonial?"
        message={`Are you sure you want to delete review from "${reviewToDelete?.name}"? It will no longer appear on the website.`}
        confirmLabel="Delete Review"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onClose={() => setReviewToDelete(null)}
      />
    </div>
  );
};
