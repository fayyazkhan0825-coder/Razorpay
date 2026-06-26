import React, { useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import Dashboard from './pages/dashboard/Dashboard';
import EmployeeDirectory from './pages/dashboard/EmployeeDirectory';
import ReimbursementList from './pages/reimbursement/ReimbursementList';
import CreateReimbursement from './pages/reimbursement/CreateReimbursement';
import ProfilePage from './pages/profile/ProfilePage';
import SettingsPage from './pages/settings/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import Breadcrumb from './components/layout/Breadcrumb';
import Footer from './components/layout/Footer';
import Loader from './components/common/Loader';
import { Toaster } from 'react-hot-toast';

// 1. Private Routes Layout Wrapper
const Layout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-bg dark:bg-bg-dark transition-colors duration-300 w-full">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />
      <div 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 w-full
          ${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}
        `}
      >
        <Navbar 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
        />
        <Breadcrumb />
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

// 2. Private Route Guard
const PrivateRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader message="Verifying session credentials..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout />;
};

// 3. Public-Only Guard (Login/Register access prevention if logged in)
const PublicOnlyRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader message="Checking authentication status..." />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

// 4. Role Guard
const RoleRoute = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    toast.error('Access Denied. You do not have permissions to access this page.');
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

const App = () => {
  return (
    <div className="w-full min-h-screen">
      {/* Toast Notifications */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          className: 'dark:bg-slate-900 dark:text-white dark:border dark:border-slate-800 text-xs font-semibold py-3 px-4 rounded-xl shadow-md border border-slate-100',
          duration: 4000
        }}
      />
      
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Private Routes */}
        <Route element={<PrivateRoute />}>
          {/* Default redirect to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route path="/dashboard" element={<Dashboard />} />
          
          <Route path="/reimbursements" element={<ReimbursementList />} />
          
          {/* Only Employee can create claims */}
          <Route element={<RoleRoute allowedRoles={['EMP']} />}>
            <Route path="/reimbursements/create" element={<CreateReimbursement />} />
          </Route>
          
          {/* CFO & RM & APE can access Employee Directory */}
          <Route element={<RoleRoute allowedRoles={['RM', 'APE', 'CFO']} />}>
            <Route path="/employees" element={<EmployeeDirectory />} />
          </Route>

          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
};

export default App;
