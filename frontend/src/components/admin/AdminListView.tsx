import { Clock, Calendar, Check, X, CheckCircle2, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useAppDispatch } from '../../store/index.js';
import { updateBookingStatusAdmin, deleteBookingAdmin } from '../../store/adminSlice.js';
import { showSuccessToast, showErrorToast } from '../../store/toastSlice.js';
import { Badge } from '../common/Badge.js';
import { ConfirmModal } from '../common/ConfirmModal.js';
import type { Booking, BookingStatus } from '../../types/index.js';

interface AdminListViewProps {
  bookings: Booking[];
  isLoading?: boolean;
}

export const AdminListView: React.FC<AdminListViewProps> = ({ bookings, isLoading }) => {
  const dispatch = useAppDispatch();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleStatusUpdate = (id: string, status: BookingStatus) => {
    dispatch(updateBookingStatusAdmin({ id, status }));
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteBookingAdmin(deleteId)).unwrap();
      dispatch(showSuccessToast('Appointment deleted successfully!'));
      setDeleteId(null);
    } catch (err: any) {
      dispatch(showErrorToast(typeof err === 'string' ? err : err?.message || 'Delete failed'));
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center text-sm text-gray-400">Loading appointments...</div>;
  }

  if (bookings.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-gray-100">
        <p className="text-sm font-semibold text-gray-700">No appointments found</p>
        <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or date range.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-3.5 px-4">Ref ID</th>
              <th className="py-3.5 px-4">Client</th>
              <th className="py-3.5 px-4">Service</th>
              <th className="py-3.5 px-4">Date & Time</th>
              <th className="py-3.5 px-4">Price</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bookings.map((booking) => {
              const customerName =
                typeof booking.customer === 'object' ? booking.customer.name : 'Client';
              const customerEmail =
                typeof booking.customer === 'object' ? booking.customer.email : '';
              const serviceName =
                typeof booking.service === 'object' ? booking.service.name : 'Salon Service';
              const duration =
                typeof booking.service === 'object' ? booking.service.duration : 45;

              const date = new Date(booking.startTime);
              const dateStr = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const timeStr = date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              });

              return (
                <tr key={booking._id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-gray-500">
                    {booking._id.slice(-6).toUpperCase()}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-gray-900">{customerName}</p>
                    <p className="text-[10px] text-gray-400">{customerEmail}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-medium text-gray-800">{serviceName}</p>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {duration}m
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-medium text-gray-800 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" /> {dateStr}
                    </p>
                    <p className="text-[10px] text-gray-500">{timeStr}</p>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-gray-900">
                    ${booking.totalPrice} {booking.currency || 'CAD'}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge status={booking.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1">
                    {booking.status === 'pending' && (
                      <button
                        title="Confirm"
                        onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {booking.status === 'confirmed' && (
                      <button
                        title="Complete"
                        onClick={() => handleStatusUpdate(booking._id, 'completed')}
                        className="p-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                      <button
                        title="Cancel"
                        onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                        className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      title="Delete appointment"
                      onClick={() => setDeleteId(booking._id)}
                      className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={Boolean(deleteId)}
        title="Delete Appointment Record?"
        message="Are you sure you want to permanently delete this appointment from the database? This cannot be undone."
        confirmLabel="Delete Permanently"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
};
