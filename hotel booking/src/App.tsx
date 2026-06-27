import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { AppProvider, useApp } from './store/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { SearchResults } from './pages/SearchResults';
import { HotelDetails } from './pages/HotelDetails';
import { Booking } from './pages/Booking';
import { Dashboard } from './pages/Dashboard';
import { OwnerPortal } from './pages/OwnerPortal';
import { StaffPortal } from './pages/StaffPortal';
import { AdminPortal } from './pages/AdminPortal';
import { Auth } from './pages/Auth';
import { AccessDenied } from './pages/AccessDenied';
import { BecomePartner } from './pages/BecomePartner';
import { SupportPage } from './pages/SupportPage';
import { Invoice } from './pages/Invoice';
import { AiAssistant } from './pages/AiAssistant';
import { LoadingScreen } from './components/layout/LoadingScreen';
import { ToastProvider } from './components/common/Toast';
import { CommandSearch } from './components/common/CommandSearch';
import { AiChatWidget } from './components/common/AiChatWidget';

// Global Error Boundary Class Component
class GlobalErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("GlobalErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-center p-6 space-y-6">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center text-3xl font-extrabold shadow-sm">
            ⚠️
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900">Something went wrong</h1>
            <p className="text-slate-500 text-xs font-bold leading-relaxed max-w-md mx-auto">
              An unexpected error occurred. Please try reloading the page or return home.
            </p>
          </div>
          <button
            onClick={() => {
              window.location.href = "/";
            }}
            className="bg-slate-900 hover:bg-brand-500 text-white font-extrabold text-xs py-3 px-6 rounded-xl transition-all shadow-sm border-none cursor-pointer"
          >
            Go Back Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// 404 Fallback page
const NotFound: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-6">
      <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-3xl font-extrabold shadow-sm">
        🔍
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-slate-900">404 - Page Not Found</h1>
        <p className="text-slate-500 text-xs font-bold leading-relaxed max-w-md mx-auto">
          The page you are looking for does not exist or has been relocated.
        </p>
      </div>
      <button
        onClick={() => navigate('/')}
        className="bg-slate-900 hover:bg-brand-500 text-white font-extrabold text-xs py-3 px-6 rounded-xl transition-all shadow-sm border-none cursor-pointer"
      >
        Back to Home
      </button>
    </div>
  );
};

// Helper component inside BrowserRouter to sync URL changes to the AppContext role
const RouteSynchronizer: React.FC = () => {
  const location = useLocation();
  const { setCurrentRole } = useApp();

  useEffect(() => {
    const path = location.pathname;
    console.log("Route changed to:", path, "with search params:", location.search);
    if (path.startsWith('/admin')) {
      setCurrentRole('admin');
    } else if (path.startsWith('/partner') || path.startsWith('/owner')) {
      setCurrentRole('owner');
    } else {
      setCurrentRole('guest');
    }
  }, [location.pathname, location.search, setCurrentRole]);

  return null;
};

// Route Guards to protect sensitive dashboards & operation desks individually
const GuestProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useApp();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
};

const PartnerProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, currentUser } = useApp();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (currentUser?.role !== 'PARTNER') {
    return <Navigate to="/403" replace />;
  }
  return <>{children}</>;
};

const StaffProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, currentUser } = useApp();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (currentUser?.role !== 'STAFF') {
    return <Navigate to="/403" replace />;
  }
  return <>{children}</>;
};

const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, currentUser } = useApp();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (currentUser?.role !== 'ADMIN') {
    return <Navigate to="/403" replace />;
  }
  return <>{children}</>;
};

// Workspace redirect hub
const WorkspaceRedirect: React.FC = () => {
  const { isAuthenticated, currentUser } = useApp();

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }
  if (currentUser.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }
  if (currentUser.role === 'PARTNER') {
    return <Navigate to="/partner" replace />;
  }
  if (currentUser.role === 'STAFF') {
    return <Navigate to="/staff" replace />;
  }
  return <Navigate to="/dashboard" replace />;
};

// Layout component using Outlet
const AppLayout: React.FC<{ isLoading: boolean; setIsLoading: (loading: boolean) => void }> = ({ isLoading, setIsLoading }) => {
  const location = useLocation();
  const isWorkspace = location.pathname.startsWith('/admin') || 
                      location.pathname.startsWith('/partner') || 
                      location.pathname.startsWith('/staff') || 
                      location.pathname.startsWith('/owner') || 
                      location.pathname === '/403';

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      {/* Loading Screen Overlay */}
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}

      {/* Header Navigation */}
      {!isWorkspace && <Navbar />}

      {/* Synchronize URL paths with context role */}
      <RouteSynchronizer />

      {/* Main View Area */}
      <div className="flex-grow">
        <Outlet />
      </div>

      {/* Footer Navigation */}
      {!isWorkspace && <Footer />}
    </div>
  );
};

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Routes>
      <Route element={<AppLayout isLoading={isLoading} setIsLoading={setIsLoading} />}>
        <Route path="/" element={<Home />} />
        <Route path="/hotels" element={<SearchResults />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/hotel/:id" element={<HotelDetails />} />
        <Route path="/destinations" element={<Navigate to="/#destinations" replace />} />
        <Route path="/deals" element={<Navigate to="/#deals" replace />} />
        
        {/* Booking flow */}
        <Route path="/booking/:hotelId/:roomId" element={
          <GuestProtectedRoute>
            <Booking />
          </GuestProtectedRoute>
        } />

        {/* Guest Dashboard & Redirects */}
        <Route path="/dashboard" element={
          <GuestProtectedRoute>
            <Dashboard />
          </GuestProtectedRoute>
        } />
        <Route path="/bookings" element={
          <GuestProtectedRoute>
            <Dashboard />
          </GuestProtectedRoute>
        } />
        <Route path="/profile" element={
          <GuestProtectedRoute>
            <Dashboard />
          </GuestProtectedRoute>
        } />
        <Route path="/wishlist" element={
          <GuestProtectedRoute>
            <Dashboard />
          </GuestProtectedRoute>
        } />
        <Route path="/ai-assistant" element={<AiAssistant />} />

        <Route path="/invoice/:invoiceId" element={
          <GuestProtectedRoute>
            <Invoice />
          </GuestProtectedRoute>
        } />
        
        {/* Partner/Owner Portal */}
        <Route path="/partner" element={<Navigate to="/partner/dashboard" replace />} />
        <Route path="/partner/dashboard" element={
          <PartnerProtectedRoute>
            <OwnerPortal />
          </PartnerProtectedRoute>
        } />
        <Route path="/partner/login" element={<Navigate to="/login" replace />} />
        
        {/* Legacy route fallback redirect */}
        <Route path="/owner" element={<Navigate to="/partner/dashboard" replace />} />
        
        {/* Staff Portal */}
        <Route path="/staff" element={
          <StaffProtectedRoute>
            <StaffPortal />
          </StaffProtectedRoute>
        } />
        <Route path="/staff/dashboard" element={<Navigate to="/staff" replace />} />
        <Route path="/staff/login" element={<Navigate to="/login" replace />} />
        
        {/* Admin Portal */}
        <Route path="/admin" element={
          <AdminProtectedRoute>
            <AdminPortal />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/dashboard" element={
          <AdminProtectedRoute>
            <Navigate to="/admin" replace />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/*" element={
          <AdminProtectedRoute>
            <Navigate to="/admin" replace />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />

        {/* Access Denied */}
        <Route path="/403" element={<AccessDenied />} />

        {/* Become Partner Onboarding Flow */}
        <Route path="/become-partner" element={<BecomePartner />} />

        {/* Support Page */}
        <Route path="/support" element={<SupportPage />} />

        {/* Authentication Pages */}
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/signup" element={<Auth mode="signup" />} />
        <Route path="/register" element={<Navigate to="/signup" replace />} />

        {/* Workspace redirect hub */}
        <Route path="/workspace" element={<WorkspaceRedirect />} />

        {/* Default 404 Fallback */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <GlobalErrorBoundary>
      <AppProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppContent />
            <CommandSearch />
            <AiChatWidget />
          </BrowserRouter>
        </ToastProvider>
      </AppProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
