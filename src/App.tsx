import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import clsx from 'clsx';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { TabProvider } from './contexts/TabContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoginForm } from './components/auth/LoginForm';
import { CompanySelection } from './components/companies/CompanySelection';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { TabBar } from './components/layout/TabBar';
import { VehicleList } from './components/vehicles/VehicleList';
import { VehicleReportView } from './components/vehicles/VehicleReportView';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { DamageReviewPage } from './pages/DamageReviewPage';
import DamageRecapPage from './pages/DamageRecapPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiresCompany?: boolean }> = ({
  children,
  requiresCompany = false
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  console.log('ProtectedRoute render:', { isAuthenticated, isLoading, requiresCompany, hasCompanyId: !!user?.companyId, userId: user?.id });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Initializing..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // If company selection is required and user hasn't selected one
  // Skip this check during navigation to allow the selection to complete
  if (requiresCompany && !user?.companyId && window.location.pathname === '/') {
    console.log('Showing CompanySelection because companyId is missing');
    return <CompanySelection />;
  }

  return <>{children}</>;
};

// Main Layout Component
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      const collapsed = localStorage.getItem('sidebarCollapsed') === 'true';
      setSidebarCollapsed(collapsed);
    };

    handleStorageChange();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('sidebarToggle', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sidebarToggle', handleStorageChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar />
      <div className={clsx(
        "pt-14 sm:pt-16 transition-all duration-300",
        sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"
      )}>
        <TabBar />
        <main className="h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

// Placeholder components for missing routes
const Analytics = () => (
  <div className="p-6">
    <div className="text-center py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Analytics Dashboard</h1>
      <p className="text-gray-600">Analytics and reporting features coming soon</p>
    </div>
  </div>
);

const Users = () => (
  <div className="p-6">
    <div className="text-center py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">User Management</h1>
      <p className="text-gray-600">User management features coming soon</p>
    </div>
  </div>
);

const Companies = () => (
  <div className="p-6">
    <div className="text-center py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Company Management</h1>
      <p className="text-gray-600">Company management features coming soon</p>
    </div>
  </div>
);

const Settings = () => (
  <div className="p-6">
    <div className="text-center py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
      <p className="text-gray-600">Application settings coming soon</p>
    </div>
  </div>
);

const Support = () => (
  <div className="p-6">
    <div className="text-center py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Support Center</h1>
      <p className="text-gray-600">Help and support resources coming soon</p>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <Router>
            <TabProvider>
              <div className="App">
                <Routes>
              <Route path="/login" element={<LoginForm />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/*" element={
                <ProtectedRoute>
                  <Routes>
                    <Route path="/company-selection" element={<CompanySelection />} />
                    <Route path="/damage-review/:reportId" element={
                      <ProtectedRoute requiresCompany>
                        <DamageReviewPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/damage-recap/:reportId" element={
                      <ProtectedRoute requiresCompany>
                        <DamageRecapPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/*" element={
                      <ProtectedRoute requiresCompany>
                        <Layout>
                          <Routes>
                            <Route path="/" element={<Navigate to="/vehicles" replace />} />
                            <Route path="/vehicles" element={<VehicleList />} />
                            <Route path="/vehicles/:vehicleId/report" element={<VehicleReportView />} />
                            <Route path="/analytics" element={<Analytics />} />
                            <Route path="/users" element={<Users />} />
                            <Route path="/companies" element={<Companies />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/support" element={<Support />} />
                            <Route path="*" element={<Navigate to="/vehicles" replace />} />
                          </Routes>
                        </Layout>
                      </ProtectedRoute>
                    } />
                  </Routes>
                </ProtectedRoute>
              } />
            </Routes>

            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  style: {
                    background: '#10b981',
                  },
                },
                error: {
                  duration: 5000,
                  style: {
                    background: '#ef4444',
                  },
                },
              }}
            />
              </div>
            </TabProvider>
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;