import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Scissors, User as UserIcon, LogOut, Calendar, LayoutDashboard, Menu, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/index.js';
import { logoutUser } from '../../store/authSlice.js';
import { openBookingModal } from '../../store/bookingSlice.js';
import { showSuccessToast } from '../../store/toastSlice.js';

export const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    dispatch(showSuccessToast('Signed out successfully!'));
    setDropdownOpen(false);
    navigate('/');
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    } else {
      navigate('/');
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (id === 'home') {
      if (location.pathname !== '/') {
        navigate('/');
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      return;
    }
    if (location.pathname !== '/') {
      navigate(`/#${id}`);
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo matching Screenshot 2 */}
          <Link
            to="/"
            onClick={handleLogoClick}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-200 group-hover:scale-105 transition-transform">
              <Scissors className="w-5 h-5 -rotate-45" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-gray-900 group-hover:text-purple-700 transition-colors">
                Perfect Darshan
              </span>
              <span className="text-[10px] uppercase tracking-wider text-purple-600 font-medium">
                BookEase Luxury Salon
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <button
              onClick={() => scrollToSection('home')}
              className="hover:text-purple-700 transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('services')}
              className="hover:text-purple-700 transition-colors"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection('stylists')}
              className="hover:text-purple-700 transition-colors"
            >
              Stylists
            </button>
            <button
              onClick={() => scrollToSection('gallery')}
              className="hover:text-purple-700 transition-colors"
            >
              Gallery
            </button>
            <button
              onClick={() => scrollToSection('testimonials')}
              className="hover:text-purple-700 transition-colors"
            >
              Testimonials
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="hover:text-purple-700 transition-colors"
            >
              Contact
            </button>
          </nav>

          {/* Right Action Items */}
          <div className="hidden md:flex items-center gap-5">
            {/* Book Now Button matching Screenshot 2 */}
            <button
              id="nav-book-now-btn"
              onClick={() => dispatch(openBookingModal())}
              className="px-5 py-2.5 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-semibold shadow-md shadow-purple-200 transition-all active:scale-95"
            >
              Book Now
            </button>

            {/* User Menu / Login */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-gray-200 hover:border-purple-300 transition-colors text-sm font-medium text-gray-700"
                >
                  <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium bg-purple-50 text-purple-700 rounded-full capitalize">
                        {user.role} Account
                      </span>
                    </div>

                    {user.role !== 'admin' && (
                      <Link
                        to="/my-bookings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                      >
                        <Calendar className="w-4 h-4 text-purple-600" />
                        My Appointments
                      </Link>
                    )}

                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-indigo-700 font-semibold hover:bg-indigo-50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-purple-700 transition-colors px-3 py-2"
              >
                <UserIcon className="w-4 h-4" />
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => dispatch(openBookingModal())}
              className="px-3 py-1.5 rounded-lg bg-[#7C3AED] text-white text-xs font-semibold shadow-sm"
            >
              Book Now
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-6 space-y-3">
          <button
            onClick={() => scrollToSection('home')}
            className="block w-full text-left py-2 text-base font-medium text-gray-700 hover:text-purple-700"
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection('services')}
            className="block w-full text-left py-2 text-base font-medium text-gray-700 hover:text-purple-700"
          >
            Services
          </button>
          <button
            onClick={() => scrollToSection('stylists')}
            className="block w-full text-left py-2 text-base font-medium text-gray-700 hover:text-purple-700"
          >
            Stylists
          </button>
          <button
            onClick={() => scrollToSection('gallery')}
            className="block w-full text-left py-2 text-base font-medium text-gray-700 hover:text-purple-700"
          >
            Gallery
          </button>
          <button
            onClick={() => scrollToSection('testimonials')}
            className="block w-full text-left py-2 text-base font-medium text-gray-700 hover:text-purple-700"
          >
            Testimonials
          </button>
          <button
            onClick={() => scrollToSection('contact')}
            className="block w-full text-left py-2 text-base font-medium text-gray-700 hover:text-purple-700"
          >
            Contact
          </button>

          <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
            {isAuthenticated && user ? (
              <>
                {user.role !== 'admin' && (
                  <Link
                    to="/my-bookings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 py-2 text-sm text-gray-700"
                  >
                    <Calendar className="w-4 h-4 text-purple-600" />
                    My Appointments
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 py-2 text-sm text-indigo-700 font-semibold"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 py-2 text-sm text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out ({user.name})
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gray-100 text-gray-800 text-sm font-semibold"
              >
                <UserIcon className="w-4 h-4" />
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
