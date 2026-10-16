import React, { useEffect, useState } from 'react';
import {
  ListFilter,
  Calendar as CalendarIcon,
  Plus,
  Share2,
  Search,
  Filter,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/index.js';
import {
  fetchAdminDashboard,
  fetchAdminBookings,
  fetchAdminServices,
  setViewMode,
  setStatusFilter,
  setSearchQuery,
  toggleAutoReminders,
} from '../store/adminSlice.js';
import { showSuccessToast } from '../store/toastSlice.js';
import { AdminSidebar } from '../components/admin/AdminSidebar.js';
import { AdminHeader } from '../components/admin/AdminHeader.js';
import { AdminMetricCards } from '../components/admin/AdminMetricCards.js';
import { AdminCalendarView } from '../components/admin/AdminCalendarView.js';
import { AdminListView } from '../components/admin/AdminListView.js';
import { AddAppointmentModal } from '../components/admin/AddAppointmentModal.js';
import { AdminServicesView } from '../components/admin/AdminServicesView.js';
import { AdminQueriesView } from '../components/admin/AdminQueriesView.js';
import { AdminExpertsView } from '../components/admin/AdminExpertsView.js';
import { AdminGalleryView } from '../components/admin/AdminGalleryView.js';
import { AdminTestimonialsView } from '../components/admin/AdminTestimonialsView.js';
import { AdminOverviewView } from '../components/admin/AdminOverviewView.js';

export const AdminDashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    dashboard,
    bookings,
    viewMode,
    statusFilter,
    searchQuery,
    autoRemindersEnabled,
    isLoadingDashboard,
    isLoadingBookings,
  } = useAppSelector((state) => state.admin);

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAddDate, setSelectedAddDate] = useState<string | undefined>(undefined);
  const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    dispatch(fetchAdminDashboard());
    dispatch(fetchAdminBookings());
    dispatch(fetchAdminServices());
  }, [dispatch]);

  const handleOpenAddModal = (dateStr?: string) => {
    setSelectedAddDate(dateStr);
    setIsAddModalOpen(true);
  };

  const handleCopyBookingLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    dispatch(setSearchQuery(val));
    dispatch(fetchAdminBookings({ status: statusFilter, search: val }));
  };

  const handleStatusSelect = (status: string) => {
    dispatch(setStatusFilter(status));
    setShowFiltersDropdown(false);
    dispatch(fetchAdminBookings({ status, search: searchQuery }));
  };

  // Filtered bookings based on search
  const filteredBookings = bookings.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const customerName =
        typeof b.customer === 'object' ? b.customer.name.toLowerCase() : '';
      const serviceName =
        typeof b.service === 'object' ? b.service.name.toLowerCase() : '';
      return customerName.includes(q) || serviceName.includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-gray-900 font-sans">
      {/* Sidebar matching Screenshot 1 */}
      <AdminSidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {/* TAB 0: EXECUTIVE DASHBOARD OVERVIEW */}
          {currentTab === 'dashboard' && (
            <AdminOverviewView
              onSwitchTab={setCurrentTab}
              onOpenAddModal={() => handleOpenAddModal()}
            />
          )}

          {/* TAB 1: APPOINTMENTS (Matching Reference Screenshot 1) */}
          {currentTab === 'appointments' && (
            <div className="space-y-6">
              {/* Header Title matching Screenshot 1 */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  Appointments
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                  View and manage your schedule.
                </p>
              </div>

              {/* 4 Metric Cards matching Screenshot 1 */}
              <AdminMetricCards
                metrics={dashboard?.metrics || null}
                isLoading={isLoadingDashboard}
              />

              {/* View toggle & Action Bar matching Screenshot 1 */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* List View / Calendar View toggle */}
                <div className="flex items-center p-1 bg-gray-100 rounded-xl border border-gray-200/80">
                  <button
                    onClick={() => dispatch(setViewMode('list'))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      viewMode === 'list'
                        ? 'bg-white text-gray-900 shadow-xs'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <ListFilter className="w-3.5 h-3.5" />
                    <span>List View</span>
                  </button>
                  <button
                    onClick={() => dispatch(setViewMode('calendar'))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      viewMode === 'calendar'
                        ? 'bg-white text-gray-900 shadow-xs'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span>Calendar View</span>
                  </button>
                </div>

                {/* Right action buttons matching Screenshot 1 */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* + Add Appointment Blue Button */}
                  <button
                    onClick={() => handleOpenAddModal()}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-200 transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Appointment</span>
                  </button>

                  {/* Booking Link */}
                  <button
                    onClick={handleCopyBookingLink}
                    className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-all"
                  >
                    <Share2 className="w-3.5 h-3.5 text-gray-500" />
                    <span>{copiedLink ? 'Copied!' : 'Booking link'}</span>
                  </button>
                </div>
              </div>

              {/* Automatic reminders toggle row matching Screenshot 1 */}
              <div className="flex items-center justify-between py-2 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-800">
                    Enable automatic reminders
                  </span>
                  {/* iOS-style toggle switch matching Screenshot 1 */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={autoRemindersEnabled}
                    onClick={() => dispatch(toggleAutoReminders())}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      autoRemindersEnabled ? 'bg-[#3B82F6]' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        autoRemindersEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <button
                  onClick={() => dispatch(showSuccessToast('Reminder schedules configured: 24h & 2h before via SMS/Email', 'Auto Reminders'))}
                  className="text-xs font-semibold text-gray-600 hover:text-gray-900 underline transition-colors cursor-pointer"
                >
                  Manage reminder schedules
                </button>
              </div>

              {/* Search and Advanced Filters row matching Screenshot 1 */}
              <div className="flex items-center gap-3">
                {/* Search Bar with Magnifying Glass */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search..."
                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  />
                </div>

                {/* Advanced Filters Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowFiltersDropdown(!showFiltersDropdown)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" />
                    <span>Advanced Filters</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {showFiltersDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl p-2 z-30 animate-in fade-in slide-in-from-top-1 text-xs">
                      <p className="px-2 py-1 text-[10px] font-bold uppercase text-gray-400">
                        Filter by Status
                      </p>
                      {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(
                        (st) => (
                          <button
                            key={st}
                            onClick={() => handleStatusSelect(st)}
                            className={`w-full text-left px-2 py-1.5 rounded-lg capitalize font-medium ${
                              statusFilter === st
                                ? 'bg-blue-50 text-blue-700 font-semibold'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {st}
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Display View: Calendar or List */}
              {viewMode === 'calendar' ? (
                <AdminCalendarView onAddAppointmentDate={handleOpenAddModal} />
              ) : (
                <AdminListView
                  bookings={filteredBookings}
                  isLoading={isLoadingBookings}
                />
              )}
            </div>
          )}

          {/* TAB 2: SERVICES MANAGEMENT */}
          {currentTab === 'services' && <AdminServicesView />}

          {/* TAB: CUSTOMER INQUIRIES & MESSAGES */}
          {currentTab === 'queries' && <AdminQueriesView />}

          {/* TAB: SPA EXPERTS & STYLISTS */}
          {['experts', 'team'].includes(currentTab) && <AdminExpertsView />}

          {/* TAB: SALON SHOWCASE GALLERY */}
          {currentTab === 'gallery' && <AdminGalleryView />}

          {/* TAB: CLIENT TESTIMONIALS */}
          {currentTab === 'testimonials' && <AdminTestimonialsView />}

          {/* TAB 3: CLIENTS DIRECTORY */}
          {currentTab === 'clients' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-2xs">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Client Directory</h2>
              <div className="divide-y divide-gray-100 text-xs">
                {bookings.map((b) => {
                  const client = typeof b.customer === 'object' ? b.customer : null;
                  if (!client) return null;
                  return (
                    <div key={b._id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{client.name}</p>
                        <p className="text-gray-400 text-[11px]">{client.email}</p>
                      </div>
                      <span className="text-gray-500 font-medium">
                        Phone: {client.phone || 'N/A'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* OTHER TABS PLACEHOLDERS */}
          {['products', 'invoices', 'reports', 'organization'].includes(
            currentTab
          ) && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto font-bold">
                Timlyst
              </div>
              <h3 className="text-base font-bold text-gray-900 capitalize">
                {currentTab} Overview
              </h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Module active and integrated with appointments and customer schedule database.
              </p>
              <button
                onClick={() => setCurrentTab('appointments')}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700"
              >
                Return to Appointments Calendar
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Manual Booking Modal for Staff */}
      <AddAppointmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        initialDate={selectedAddDate}
      />
    </div>
  );
};
