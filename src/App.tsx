import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { Toaster } from 'react-hot-toast';

// Pages
import LoginPage from './pages/auth/LoginPage';
import ProfilePage from './pages/auth/ProfilePage';
import ChangePasswordPage from './pages/auth/ChangePasswordPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import AppointmentsPage from './pages/dashboard/AppointmentsPage';
import ProfessionalsPage from './pages/dashboard/ProfessionalsPage';
import ServicesPage from './pages/dashboard/ServicesPage';
import CustomersPage from './pages/dashboard/CustomersPage';
import BusinessHoursPage from './pages/dashboard/BusinessHoursPage';
import ResourcesPage from './pages/dashboard/ResourcesPage';
import ResourceBookingsPage from './pages/dashboard/ResourceBookingsPage';
import ChatbotPage from './pages/dashboard/ChatbotPage';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';

// Layout
import DashboardLayout from './components/common/DashboardLayout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="professionals" element={<ProfessionalsPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="business-hours" element={<BusinessHoursPage />} />
            <Route path="resources" element={<ResourcesPage />} />
            <Route path="resource-bookings" element={<ResourceBookingsPage />} />
            <Route path="chatbot" element={<ChatbotPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="change-password" element={<ChangePasswordPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#363636',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
