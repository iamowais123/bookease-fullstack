import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAppDispatch } from './store/index.js';
import { fetchCurrentUser } from './store/authSlice.js';
import { getCsrfToken } from './api/client.js';
import { HomePage } from './pages/HomePage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { MyBookingsPage } from './pages/MyBookingsPage.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';
import { ProtectedRoute } from './components/common/ProtectedRoute.js';
import { ToastContainer } from './components/common/ToastContainer.js';
import { ScrollToTop } from './components/common/ScrollToTop.js';

export const App: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Bootstrap CSRF token and verify existing session
    getCsrfToken().catch((err) => {
      console.warn('Initial CSRF fetch failed (will retry on mutation):', err);
    });
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return (
    <>
      <ScrollToTop />
      <ToastContainer />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Customer Protected Route */}
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <MyBookingsPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Protected Route */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
};
