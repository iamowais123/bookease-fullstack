import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, DollarSign, XCircle, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/index.js';
import { fetchMyBookings, cancelMyBooking, deleteMyBooking, openBookingModal } from '../store/bookingSlice.js';
import { showSuccessToast, showErrorToast } from '../store/toastSlice.js';
import { Navbar } from '../components/common/Navbar.js';
import { Footer } from '../components/common/Footer.js';
import { Badge } from '../components/common/Badge.js';
import { BookingModal } from '../components/booking/BookingModal.js';
import { ConfirmModal } from '../components/common/ConfirmModal.js';

export const MyBookingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { myBookings, isLoadingMyBookings } = useAppSelector((state) => state.booking);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMyBookings());
    }
  }, [isAuthenticated, dispatch]);

  const handleOpenCancel = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setIsCancelModalOpen(true);
  };

  const handleOpenDelete = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setIsDeleteModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!selectedBookingId) return;
    setIsProcessing(true);
    try {
      await dispatch(cancelMyBooking(selectedBookingId)).unwrap();
      dispatch(showSuccessToast('Appointment cancelled successfully!'));
      setIsCancelModalOpen(false);
    } catch (err: any) {
      dispatch(showErrorToast(typeof err === 'string' ? err : err?.message || 'Failed to cancel appointment'));
    } finally {
      setIsProcessing(false);
      setSelectedBookingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!selectedBookingId) return;
    setIsProcessing(true);
    try {
      await dispatch(deleteMyBooking(selectedBookingId)).unwrap();
      dispatch(showSuccessToast('Appointment deleted successfully!'));
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      dispatch(showErrorToast(typeof err === 'string' ? err : err?.message || 'Failed to delete appointment'));
    } finally {
      setIsProcessing(false);
      setSelectedBookingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <BookingModal />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-gray-200 gap-4">
          <div>
            <Link
              to="/"
              className="text-xs text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1 mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              My Appointments
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Welcome back, {user?.name}! View and manage your upcoming salon visits.
            </p>
          </div>

          <button
            onClick={() => dispatch(openBookingModal())}
            className="px-4 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold shadow-md shadow-purple-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Book New Appointment
          </button>
        </div>

        {isLoadingMyBookings ? (
          <div className="py-20 text-center text-sm text-gray-400">Loading your bookings...</div>
        ) : myBookings.length === 0 ? (
          <div className="mt-12 bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-2xs">
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No appointments scheduled</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-6">
              You haven&apos;t booked any salon treatments yet. Experience luxury hair and beauty styling today.
            </p>
            <button
              onClick={() => dispatch(openBookingModal())}
              className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 shadow-sm"
            >
              Browse Services & Book
            </button>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {myBookings.map((b) => {
              const service = typeof b.service === 'object' ? b.service : null;
              const date = new Date(b.startTime);
              const dateFormatted = date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const timeFormatted = date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={b._id || b.id}
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono uppercase text-gray-400">
                        Ref: {(b._id || b.id || '').slice(-6).toUpperCase()}
                      </span>
                      <Badge status={b.status} />
                    </div>

                    <h3 className="text-lg font-bold text-gray-900">
                      {service?.name || 'Salon Treatment'}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1.5 font-medium text-gray-700">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        {dateFormatted}
                      </span>
                      <span className="flex items-center gap-1.5 font-medium text-gray-700">
                        <Clock className="w-4 h-4 text-purple-600" />
                        {timeFormatted} ({service?.duration || 45} mins)
                      </span>
                      <span className="flex items-center gap-1 font-bold text-gray-900">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        ${b.totalPrice} {b.currency || 'CAD'}
                      </span>
                    </div>

                    {b.notes && (
                      <p className="text-xs text-gray-400 italic bg-gray-50 p-2 rounded-lg max-w-lg">
                        Note: &ldquo;{b.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    {b.status !== 'cancelled' && b.status !== 'completed' && (
                      <button
                        onClick={() => handleOpenCancel(b._id || (b.id as string))}
                        className="px-3.5 py-2 rounded-xl border border-amber-200 text-amber-700 hover:bg-amber-50 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Cancel this appointment"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenDelete(b._id || (b.id as string))}
                      className="px-3.5 py-2 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-100 text-red-600 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Permanently remove from your appointments"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />

      {/* In-app Screen Modal for Delete Confirmation */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Appointment?"
        message="Are you sure you want to delete this appointment from your history? This action will remove the record."
        confirmLabel="Delete"
        cancelLabel="Keep"
        variant="danger"
        isLoading={isProcessing}
        onConfirm={confirmDelete}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedBookingId(null);
        }}
      />

      {/* In-app Screen Modal for Cancel Confirmation */}
      <ConfirmModal
        isOpen={isCancelModalOpen}
        title="Cancel Appointment?"
        message="Are you sure you want to cancel this scheduled appointment? Your reserved time slot will be made available to other clients."
        confirmLabel="Cancel Appointment"
        cancelLabel="Keep Booking"
        variant="warning"
        isLoading={isProcessing}
        onConfirm={confirmCancel}
        onClose={() => {
          setIsCancelModalOpen(false);
          setSelectedBookingId(null);
        }}
      />
    </div>
  );
};
