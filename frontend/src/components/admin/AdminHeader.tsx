import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Share2,
  Bell,
  PanelLeft,
  Check,
  ExternalLink,
  Copy,
  LogOut,
  User as UserIcon,
  Globe,
  Calendar,
  X,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/index.js';
import { logoutUser } from '../../store/authSlice.js';
import { showSuccessToast } from '../../store/toastSlice.js';

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleSidebar }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { bookings } = useAppSelector((state) => state.admin);

  const [copied, setCopied] = useState(false);
  const [showTilyModal, setShowTilyModal] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [hasUnreadAlerts, setHasUnreadAlerts] = useState(true);

  const shareRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (shareRef.current && !shareRef.current.contains(target)) {
        setShowShareMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const bookingUrl = window.location.origin;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    dispatch(showSuccessToast(`Booking page URL copied: ${bookingUrl}`));
    setTimeout(() => setCopied(false), 2500);
  };

  const handleLogout = async () => {
    setShowProfileMenu(false);
    await dispatch(logoutUser());
    dispatch(showSuccessToast('Signed out successfully!'));
    navigate('/login');
  };

  // Recent active booking notifications
  const recentBookings = bookings.slice(0, 4);

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
            title="Toggle Sidebar"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* 1. Ask Tily Button */}
          <button
            onClick={() => setShowTilyModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Ask Tily</span>
          </button>

          {/* 2. Share Booking Page with Dropdown */}
          <div className="relative" ref={shareRef}>
            <button
              onClick={() => {
                handleCopyLink();
                setShowShareMenu(!showShareMenu);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors shadow-2xs cursor-pointer"
              title="Share your booking page"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-bold">Copied Link!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-gray-500" />
                  <span>Share your booking page</span>
                </>
              )}
            </button>

            {showShareMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-40 text-xs animate-in fade-in slide-in-from-top-1">
                <p className="font-bold text-gray-900 mb-1 px-1">Share Public Booking Link</p>
                <p className="text-[11px] text-gray-500 mb-2.5 px-1">
                  Clients can book treatments, view styling services, and pay online.
                </p>

                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border border-gray-100 mb-2">
                  <span className="text-[11px] text-gray-600 truncate flex-1 font-mono">
                    {bookingUrl}
                  </span>
                  <button
                    onClick={handleCopyLink}
                    className="px-2 py-1 bg-white hover:bg-gray-100 rounded-lg text-[10px] font-bold border border-gray-200 shrink-0 text-blue-600 cursor-pointer"
                  >
                    Copy
                  </button>
                </div>

                <div className="space-y-1 pt-1 border-t border-gray-100">
                  <a
                    href="/"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 text-gray-700 font-medium cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                      Open Customer Website
                    </span>
                    <span className="text-[10px] text-blue-600 font-bold">New Tab</span>
                  </a>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `Book your luxury salon session online at: ${bookingUrl}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-emerald-50 text-emerald-800 font-medium cursor-pointer"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Share on WhatsApp
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* 3. Bell Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setHasUnreadAlerts(false);
              }}
              className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-full transition-colors relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {hasUnreadAlerts && (
                <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-1.5 right-1.5 ring-2 ring-white animate-pulse" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-40 text-xs animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-bold text-gray-900">Notifications</span>
                  </div>
                  <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                    {recentBookings.length} Active
                  </span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {recentBookings.length > 0 ? (
                    recentBookings.map((b: any) => {
                      const client = typeof b.customer === 'object' ? b.customer : null;
                      const svc = typeof b.service === 'object' ? b.service : null;
                      return (
                        <div
                          key={b._id}
                          className="p-2.5 rounded-xl bg-gray-50 hover:bg-blue-50/50 border border-gray-100 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-gray-900">
                              {client?.name || 'Walk-in Client'}
                            </p>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize ${
                                b.status === 'confirmed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : b.status === 'completed'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {b.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-600 mt-0.5 font-medium">
                            {svc?.name || 'Treatment'} • ${b.totalPrice || b.price || 0}{' '}
                            {b.currency || 'CAD'}
                          </p>
                          <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {b.startTime
                                ? new Date(b.startTime).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : 'Scheduled'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-gray-400 text-xs">
                      No recent notifications
                    </div>
                  )}

                  {/* Operational Notice */}
                  <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-emerald-900 text-[11px] flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">All Systems Operational</p>
                      <p className="text-[10px] text-emerald-700">
                        MongoDB Atlas & Cloudinary connected and active.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 mt-2 border-t border-gray-100 text-center">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/admin');
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700"
                  >
                    View All Activity
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4. User Avatar with Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-purple-100 hover:ring-purple-300 transition-all cursor-pointer"
              title="Admin Account Profile"
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'T'}
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-40 text-xs animate-in fade-in slide-in-from-top-1">
                {/* User Info Header */}
                <div className="p-2.5 bg-gray-50 rounded-xl mb-1.5 border border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'T'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 truncate">
                        {user?.name || 'Administrator'}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate">
                        {user?.email || 'admin@bookease.com'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-bold">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Administrator</span>
                  </div>
                </div>

                {/* Profile Actions */}
                <div className="space-y-0.5">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/');
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium text-left cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5 text-gray-500" />
                    <span>View Customer Website</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/my-bookings');
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium text-left cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                    <span>My Account & Bookings</span>
                  </button>

                  <div className="my-1 border-t border-gray-100" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors font-semibold text-left cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Ask Tily Modal dialog */}
      {showTilyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Tily Schedule Assistant</h3>
                <p className="text-[11px] text-gray-500">AI scheduling insights for your salon</p>
              </div>
            </div>

            <div className="bg-purple-50/70 p-3.5 rounded-xl border border-purple-100 text-xs text-purple-950 space-y-2 mb-4">
              <p className="font-semibold">💡 Today&apos;s Scheduling Insights:</p>
              <ul className="list-disc list-inside space-y-1 text-purple-800 text-[11px]">
                <li>Optimal booking slots are between 11:00 AM and 4:00 PM</li>
                <li>Upcoming weekend schedule is 78% booked</li>
                <li>Hydra Glow Facial is the top requested treatment this week</li>
              </ul>
            </div>

            <button
              onClick={() => setShowTilyModal(false)}
              className="w-full py-2 bg-gray-900 text-white rounded-xl text-xs font-semibold hover:bg-black transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
