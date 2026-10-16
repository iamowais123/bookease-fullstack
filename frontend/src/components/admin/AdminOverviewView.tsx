import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  DollarSign,
  Users,
  Scissors,
  Star,
  MessageSquare,
  ArrowRight,
  Plus,
  Share2,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/index.js';
import { AdminMetricCards } from './AdminMetricCards.js';
import { updateBookingStatusAdmin, deleteBookingAdmin } from '../../store/adminSlice.js';
import { showSuccessToast, showErrorToast } from '../../store/toastSlice.js';
import { ConfirmModal } from '../common/ConfirmModal.js';
import type { Booking, BookingStatus } from '../../types/index.js';

interface AdminOverviewViewProps {
  onSwitchTab: (tab: string) => void;
  onOpenAddModal: () => void;
}

export const AdminOverviewView: React.FC<AdminOverviewViewProps> = ({
  onSwitchTab,
  onOpenAddModal,
}) => {
  const dispatch = useAppDispatch();
  const { dashboard, bookings, services, isLoadingDashboard, isLoadingBookings } =
    useAppSelector((state) => state.admin);
  const { user } = useAppSelector((state) => state.auth);

  const [copiedLink, setCopiedLink] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deleteBookingId, setDeleteBookingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const metrics = dashboard?.metrics || null;
  const breakdown = dashboard?.statusBreakdown || {
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopiedLink(true);
    dispatch(showSuccessToast('Booking link copied to clipboard!'));
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    setUpdatingId(bookingId);
    try {
      await dispatch(
        updateBookingStatusAdmin({ id: bookingId, status: newStatus })
      ).unwrap();
      dispatch(showSuccessToast(`Booking marked as ${newStatus}`));
    } catch (err: any) {
      dispatch(showErrorToast(typeof err === 'string' ? err : err?.message || 'Status update failed'));
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmDeleteBooking = async () => {
    if (!deleteBookingId) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteBookingAdmin(deleteBookingId)).unwrap();
      dispatch(showSuccessToast('Appointment deleted successfully!'));
      setDeleteBookingId(null);
    } catch (err: any) {
      dispatch(showErrorToast(typeof err === 'string' ? err : err?.message || 'Failed to delete'));
    } finally {
      setIsDeleting(false);
    }
  };

  const recentBookingsList = (dashboard?.recentBookings?.length ? dashboard.recentBookings : bookings).slice(0, 6);

  const totalBookings = metrics?.totalAppointments || 0;
  const completedBookings = metrics?.completedAppointments || 0;
  const completionRate = totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 100;
  const activeBookingsCount = (metrics?.upcomingAppointments || 0) + (metrics?.completedAppointments || 0);
  const avgTicket = activeBookingsCount > 0 && metrics?.totalRevenue
    ? Math.round(metrics.totalRevenue / activeBookingsCount)
    : (metrics?.totalRevenue || 0);

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-blue-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Timlyst Salon Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Administrator'} 👋
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm max-w-xl">
              Here is your live salon operations summary. Monitor appointments, review revenue, and manage staff in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-semibold rounded-xl border border-white/20 transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'Copied Link!' : 'Share Booking Page'}</span>
            </button>
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Appointment</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Dynamic Metric Cards */}
      <AdminMetricCards metrics={metrics} isLoading={isLoadingDashboard} />

      {/* Booking Status Distribution Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Appointment Status Distribution</h3>
            <p className="text-xs text-gray-500">Live breakdown of all booked sessions across the salon</p>
          </div>
          <button
            onClick={() => onSwitchTab('appointments')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Open Calendar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-100/80">
            <div className="flex items-center justify-between text-amber-700">
              <span className="text-xs font-semibold">Pending Review</span>
              <AlertCircle className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-amber-900 mt-2">{breakdown.pending}</p>
            <span className="text-[10px] text-amber-700 font-medium">Awaiting admin confirm</span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100/80">
            <div className="flex items-center justify-between text-emerald-700">
              <span className="text-xs font-semibold">Confirmed</span>
              <Clock className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-emerald-900 mt-2">{breakdown.confirmed}</p>
            <span className="text-[10px] text-emerald-700 font-medium">Scheduled & active</span>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-100/80">
            <div className="flex items-center justify-between text-purple-700">
              <span className="text-xs font-semibold">Completed</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-purple-900 mt-2">{breakdown.completed}</p>
            <span className="text-[10px] text-purple-700 font-medium">Service fulfilled</span>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-100/80">
            <div className="flex items-center justify-between text-rose-700">
              <span className="text-xs font-semibold">Cancelled</span>
              <XCircle className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-rose-900 mt-2">{breakdown.cancelled}</p>
            <span className="text-[10px] text-rose-700 font-medium">Void or client cancelled</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Bookings Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Recent Appointments</h3>
                <p className="text-xs text-gray-500">Latest clients and reserved time slots</p>
              </div>
              <button
                onClick={() => onSwitchTab('appointments')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {isLoadingBookings ? (
              <div className="p-8 text-center text-xs text-gray-400">Loading appointments...</div>
            ) : recentBookingsList.length === 0 ? (
              <div className="p-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <Calendar className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-gray-700">No appointments recorded yet</p>
                <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
                  Bookings made by customers on the public website or scheduled manually will appear here in real-time.
                </p>
                <button
                  onClick={onOpenAddModal}
                  className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                >
                  Schedule First Appointment
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/70 text-gray-500 font-semibold border-b border-gray-100">
                    <tr>
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Service</th>
                      <th className="py-3 px-4">Scheduled Date</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentBookingsList.map((booking: any) => {
                      const client = typeof booking.customer === 'object' ? booking.customer : null;
                      const svc = typeof booking.service === 'object' ? booking.service : null;
                      const dateStr = booking.startTime
                        ? new Date(booking.startTime).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'N/A';

                      const statusColors: Record<string, string> = {
                        pending: 'bg-amber-50 text-amber-700 border-amber-200',
                        confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                        completed: 'bg-purple-50 text-purple-700 border-purple-200',
                        cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
                      };

                      return (
                        <tr key={booking._id || booking.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-gray-900">{client?.name || 'Walk-in Client'}</div>
                            <div className="text-[11px] text-gray-400">{client?.email || client?.phone || ''}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-800">{svc?.name || 'Custom Service'}</div>
                            <span className="text-[10px] text-gray-400">{svc?.category || 'Hair & Spa'}</span>
                          </td>
                          <td className="py-3 px-4 text-gray-600 font-medium whitespace-nowrap">
                            {dateStr}
                          </td>
                          <td className="py-3 px-4 font-bold text-gray-900 whitespace-nowrap">
                            ${booking.totalPrice || booking.price || 0} {booking.currency || 'CAD'}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                                statusColors[booking.status] || 'bg-gray-50 text-gray-700 border-gray-200'
                              }`}
                            >
                              {booking.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            {booking.status === 'pending' && (
                              <button
                                disabled={updatingId === booking._id}
                                onClick={() => handleStatusChange(booking._id, 'confirmed')}
                                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-50"
                              >
                                Confirm
                              </button>
                            )}
                            {booking.status === 'confirmed' && (
                              <button
                                disabled={updatingId === booking._id}
                                onClick={() => handleStatusChange(booking._id, 'completed')}
                                className="px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-50"
                              >
                                Mark Done
                              </button>
                            )}
                            {['completed', 'cancelled'].includes(booking.status) && (
                              <button
                                onClick={() => setDeleteBookingId(booking._id || booking.id)}
                                className="px-2 py-1 text-red-600 hover:bg-red-50 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                                title="Delete appointment record"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Delete</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="p-3 bg-gray-50/60 border-t border-gray-100 text-center">
            <button
              onClick={() => onSwitchTab('appointments')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1.5"
            >
              <span>Manage all appointments in Calendar view</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Salon Modules & Quick Shortcuts */}
        <div className="space-y-4">
          {/* Quick Management Hub */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-gray-900">Salon Management Hub</h3>
            <p className="text-xs text-gray-500">Fast access to dynamic platform modules</p>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => onSwitchTab('services')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-blue-50/70 border border-gray-100 hover:border-blue-200 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Scissors className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 group-hover:text-blue-700">Services Catalog</p>
                    <p className="text-[11px] text-gray-400">{services?.length || 0} active treatments</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                onClick={() => onSwitchTab('experts')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-emerald-50/70 border border-gray-100 hover:border-emerald-200 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 group-hover:text-emerald-700">Spa Experts & Stylists</p>
                    <p className="text-[11px] text-gray-400">Team roster & specialties</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                onClick={() => onSwitchTab('queries')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-purple-50/70 border border-gray-100 hover:border-purple-200 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 group-hover:text-purple-700">Inquiries & Messages</p>
                    <p className="text-[11px] text-gray-400">Customer contact queries</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                onClick={() => onSwitchTab('gallery')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-amber-50/70 border border-gray-100 hover:border-amber-200 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 group-hover:text-amber-700">Gallery Showcase</p>
                    <p className="text-[11px] text-gray-400">Portfolio & hair lookbook</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                onClick={() => onSwitchTab('testimonials')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-pink-50/70 border border-gray-100 hover:border-pink-200 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center shrink-0">
                    <Star className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 group-hover:text-pink-700">Client Reviews</p>
                    <p className="text-[11px] text-gray-400">Testimonials & ratings</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-pink-600 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>

          {/* Operational Performance Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-gray-900">Salon Performance</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-500">Service Completion Rate</span>
                <span className="font-bold text-emerald-600">{completionRate}%</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-500">Avg Ticket Value</span>
                <span className="font-bold text-gray-900">${avgTicket} CAD</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-500">Active Services</span>
                <span className="font-bold text-gray-900">{services?.length || 0} Treatments</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500">Platform Status</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  All Systems Online
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(deleteBookingId)}
        title="Delete Appointment Record?"
        message="Are you sure you want to permanently delete this appointment from the database? This cannot be undone."
        confirmLabel="Delete Permanently"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDeleteBooking}
        onClose={() => setDeleteBookingId(null)}
      />
    </div>
  );
};
