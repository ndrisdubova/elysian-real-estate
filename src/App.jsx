import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import PageLoader from './components/PageLoader';
import Maintenance from './components/Maintenance';
import { getMaintenanceMode } from './utils/storage';

const Home = lazy(() => import('./pages/Home'));
const Properties = lazy(() => import('./pages/Properties'));
const Agents = lazy(() => import('./pages/Agents'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const PropertyDetail = lazy(() => import('./pages/PropertyDetail'));
const Saved = lazy(() => import('./pages/Saved'));
const Account = lazy(() => import('./pages/Account'));
const ChatbotInfo = lazy(() => import('./pages/ChatbotInfo'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProperties = lazy(() => import('./pages/admin/AdminProperties'));
const AdminAgents = lazy(() => import('./pages/admin/AdminAgents'));
const AdminMessages = lazy(() => import('./pages/admin/AdminMessages'));
const AdminNewsletter = lazy(() => import('./pages/admin/AdminNewsletter'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const NotFound = lazy(() => import('./pages/NotFound'));

function Layout() {
  const location = useLocation();
  const noNav = ['/login', '/signup'];
  const isAdmin = location.pathname.startsWith('/admin');
  const showNav = !noNav.includes(location.pathname) && !isAdmin;

  // Maintenance mode: fetched optimistically (site renders immediately for the
  // normal case). If it comes back enabled, non-admin visitors get the
  // maintenance page. Admin routes always bypass so the team can toggle it off.
  const [maintenance, setMaintenance] = useState(false);
  useEffect(() => {
    if (isAdmin) return; 
    getMaintenanceMode().then(setMaintenance);
  }, [isAdmin]);

  if (maintenance && !isAdmin) return <Maintenance />;

  return (
    <>
      <ScrollToTop />
      {showNav && <Navbar />}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/account" element={<Account />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/chatbot-info" element={<ChatbotInfo />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          
          <Route path="*" element={<NotFound />} />

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="properties" element={<AdminProperties />} />
            <Route path="agents" element={<AdminAgents />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="newsletter" element={<AdminNewsletter />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <AdminProvider>
          <BrowserRouter>
            <Layout />
          </BrowserRouter>
        </AdminProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}
