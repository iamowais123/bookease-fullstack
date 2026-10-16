import React, { useEffect, useState } from 'react';
import {
  Users,
  Plus,
  Star,
  Trash2,
  RefreshCw,
  X,
  Sparkles,
  Award,
  AlertCircle,
} from 'lucide-react';
import { expertApi, type Expert, type CreateExpertPayload } from '../../api/expert.api.js';
import { useAppDispatch } from '../../store/index.js';
import { showErrorToast, showSuccessToast } from '../../store/toastSlice.js';
import { ImageUploadBox } from '../common/ImageUploadBox.js';
import { ConfirmModal } from '../common/ConfirmModal.js';

export const AdminExpertsView: React.FC = () => {
  const dispatch = useAppDispatch();
  const [experts, setExperts] = useState<Expert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expertToDelete, setExpertToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [experience, setExperience] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [rating, setRating] = useState('5.0');
  const [image, setImage] = useState('');
  const [bio, setBio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchExperts = async () => {
    setIsLoading(true);
    try {
      const data = await expertApi.getAllExpertsAdmin();
      setExperts(data);
    } catch (err: any) {
      dispatch(showErrorToast(err.message || 'Failed to load experts from database'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExperts();
  }, []);

  const handleOpenModal = () => {
    setName('');
    setRole('');
    setExperience('');
    setSpecialty('');
    setRating('5.0');
    setImage('');
    setBio('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !role.trim() || !experience.trim() || !specialty.trim() || !image.trim()) {
      dispatch(showErrorToast('All fields marked with * are required', 'Validation Error'));
      return;
    }

    if (/[0-9]/.test(name)) {
      dispatch(showErrorToast('Numbers are not allowed in Expert Name', 'Validation Error'));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateExpertPayload = {
        name: name.trim(),
        role: role.trim(),
        experience: experience.trim(),
        specialty: specialty.trim(),
        rating: parseFloat(rating) || 5.0,
        image: image.trim(),
        bio: bio.trim(),
      };

      const res = await expertApi.createExpert(payload);
      dispatch(showSuccessToast(res.message || 'Expert added successfully to database!'));
      setExperts((prev) => [res.expert, ...prev]);
      setIsModalOpen(false);
    } catch (err: any) {
      dispatch(showErrorToast(err.message || 'Failed to add expert', 'Error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!expertToDelete) return;
    setIsDeleting(true);
    try {
      await expertApi.deleteExpert(expertToDelete.id);
      dispatch(showSuccessToast(`Expert ${expertToDelete.name} removed successfully`));
      setExperts((prev) => prev.filter((e) => e._id !== expertToDelete.id));
      setExpertToDelete(null);
    } catch (err: any) {
      dispatch(showErrorToast(err.message || 'Failed to remove expert'));
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
            <Users className="w-5 h-5 text-blue-600" />
            Spa Stylists & Beauty Experts
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage your team of professionals. All experts are stored in MongoDB and dynamically shown on the client portal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchExperts}
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
            Add New Expert
          </button>
        </div>
      </div>

      {/* Experts Grid */}
      {isLoading && experts.length === 0 ? (
        <div className="py-16 text-center text-xs text-gray-400">Loading spa experts...</div>
      ) : experts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-2xs">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-700">No experts found in database</p>
          <p className="text-xs text-gray-400 mt-1">Click "Add New Expert" above to create one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experts.map((exp) => (
            <div
              key={exp._id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="h-48 relative overflow-hidden bg-gray-100">
                  <img
                    src={exp.image}
                    alt={exp.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs font-bold text-amber-500 flex items-center gap-1 shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{exp.rating}</span>
                  </div>
                  <span className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white px-2 py-0.5 rounded-md text-[10px] font-semibold">
                    {exp.experience}
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{exp.name}</h3>
                    <p className="text-xs text-blue-600 font-medium">{exp.role}</p>
                  </div>
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold text-gray-700">Specialty:</span> {exp.specialty}
                  </p>
                  {exp.bio && <p className="text-[11px] text-gray-400 italic line-clamp-2">{exp.bio}</p>}
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Active Expert
                </span>
                <button
                  onClick={() => setExpertToDelete({ id: exp._id, name: exp.name })}
                  className="px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Expert Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 via-white to-indigo-50 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Add New Expert Stylist
                </h3>
                <p className="text-xs text-gray-500">Save a new expert to the salon database</p>
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
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onKeyDown={(e) => {
                    if (/^[0-9]$/.test(e.key)) {
                      e.preventDefault();
                      dispatch(showErrorToast('Numbers are not allowed in Expert Name'));
                    }
                  }}
                  onChange={(e) => setName(e.target.value.replace(/[0-9]/g, ''))}
                  placeholder="Elena Rostova (Letters only)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Role / Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Master Hair Stylist"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Experience <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="e.g. 10+ Years Exp"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Specialty <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="e.g. French Balayage, Facials"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Rating (1.0 to 5.0) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    required
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <ImageUploadBox
                label="Photo Image (Upload to Cloudinary or URL)"
                value={image}
                onChange={setImage}
                required
                folder="bookease_experts"
              />

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Short Biography (Optional)</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Renowned for bespoke styling and precision cutting..."
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
                  {isSubmitting ? 'Saving...' : 'Add Expert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(expertToDelete)}
        title="Remove Stylist Expert?"
        message={`Are you sure you want to remove expert "${expertToDelete?.name}" from the database? This cannot be undone.`}
        confirmLabel="Remove Expert"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onClose={() => setExpertToDelete(null)}
      />
    </div>
  );
};
