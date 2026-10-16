import React from 'react';
import { Calendar, Clock, Check, DollarSign } from 'lucide-react';
import type { DashboardMetrics } from '../../types/index.js';

interface AdminMetricCardsProps {
  metrics: DashboardMetrics | null;
  isLoading?: boolean;
}

export const AdminMetricCards: React.FC<AdminMetricCardsProps> = ({ metrics, isLoading }) => {
  const total = metrics ? metrics.totalAppointments : 0;
  const upcoming = metrics ? metrics.upcomingAppointments : 0;
  const completed = metrics ? metrics.completedAppointments : 0;
  const revenue = metrics ? metrics.totalRevenue : 0;
  const currency = metrics?.currency || 'CAD';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Appointments */}
      <div className="p-5 rounded-2xl bg-[#EEF2FF] border border-blue-100 flex flex-col justify-between transition-all hover:shadow-sm">
        <div className="flex items-start justify-between">
          <span className="text-xs font-semibold text-gray-600">Total Appointments</span>
          <div className="w-8 h-8 rounded-lg bg-[#E0E7FF] text-[#4F46E5] flex items-center justify-center">
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
        </div>
        <div className="mt-4">
          <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {isLoading ? '...' : total}
          </span>
          <p className="text-xs text-gray-500 mt-1 font-medium">All Time</p>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="p-5 rounded-2xl bg-[#ECFDF5] border border-emerald-100 flex flex-col justify-between transition-all hover:shadow-sm">
        <div className="flex items-start justify-between">
          <span className="text-xs font-semibold text-gray-600">Upcoming Appointments</span>
          <div className="w-8 h-8 rounded-lg bg-[#D1FAE5] text-emerald-600 flex items-center justify-center">
            <Clock className="w-4 h-4 text-teal-600" />
          </div>
        </div>
        <div className="mt-4">
          <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {isLoading ? '...' : upcoming}
          </span>
          <p className="text-xs text-gray-500 mt-1 font-medium">Confirmed Only</p>
        </div>
      </div>

      {/* Completed Appointments */}
      <div className="p-5 rounded-2xl bg-[#F5F3FF] border border-purple-100 flex flex-col justify-between transition-all hover:shadow-sm">
        <div className="flex items-start justify-between">
          <span className="text-xs font-semibold text-gray-600">Completed Appointments</span>
          <div className="w-8 h-8 rounded-lg bg-[#EDE9FE] text-purple-600 flex items-center justify-center">
            <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />
          </div>
        </div>
        <div className="mt-4">
          <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {isLoading ? '...' : completed}
          </span>
          <p className="text-xs text-gray-500 mt-1 font-medium">This month</p>
        </div>
      </div>

      {/* Total Revenue */}
      <div className="p-5 rounded-2xl bg-[#FFFBEB] border border-amber-100 flex flex-col justify-between transition-all hover:shadow-sm">
        <div className="flex items-start justify-between">
          <span className="text-xs font-semibold text-gray-600">Total Revenue</span>
          <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] text-amber-700 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
        </div>
        <div className="mt-4">
          <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {isLoading
              ? '...'
              : `${revenue.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} ${currency}`}
          </span>
          <p className="text-xs text-gray-500 mt-1 font-medium">Confirmed & Completed</p>
        </div>
      </div>
    </div>
  );
};
