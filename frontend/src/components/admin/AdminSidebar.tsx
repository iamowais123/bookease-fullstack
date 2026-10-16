import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Package,
  CalendarDays,
  FileText,
  BarChart3,
  UserCheck,
  Building,
  Home,
  LogOut,
  MessageSquare,
  Image,
  MessageSquareQuote,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/index.js';
import { logoutUser } from '../../store/authSlice.js';
import { showSuccessToast } from '../../store/toastSlice.js';

interface AdminSidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentTab, setCurrentTab }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'appointments', label: 'Appointments', icon: CalendarDays },
    { id: 'services', label: 'Services', icon: Briefcase },
    { id: 'experts', label: 'Experts & Stylists', icon: UserCheck },
    { id: 'gallery', label: 'Gallery Showcase', icon: Image },
    { id: 'testimonials', label: 'Client Reviews', icon: MessageSquareQuote },
    { id: 'queries', label: 'Inquiries & Messages', icon: MessageSquare },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'products', label: 'Products', icon: Package },
  ];

  const financialItems = [
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  const adminItems = [
    { id: 'team', label: 'Team', icon: UserCheck },
    { id: 'organization', label: 'Organization', icon: Building },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none">
      <div className="p-5 flex-1 overflow-y-auto">
        {/* Brand matching screenshot 1 */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white font-bold text-lg shadow-sm">
            <span className="tracking-tighter">T</span>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg text-gray-900 tracking-tight">Timlyst</span>
            <span className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">BookEase Platform</span>
          </div>
        </div>

        {/* Primary nav */}
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#3B82F6] text-white shadow-sm shadow-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Financial Section */}
        <div className="mt-8">
          <p className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            Financial
          </p>
          <div className="space-y-1">
            {financialItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#3B82F6] text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Administration Section */}
        <div className="mt-8">
          <p className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            Administration
          </p>
          <div className="space-y-1">
            {adminItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#3B82F6] text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer controls */}
      <div className="p-4 border-t border-gray-100 space-y-2">
        <Link
          to="/"
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Home className="w-4 h-4 text-gray-400" />
          View Customer Website
        </Link>
        <button
          onClick={async () => {
            await dispatch(logoutUser());
            dispatch(showSuccessToast('Signed out successfully!'));
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
