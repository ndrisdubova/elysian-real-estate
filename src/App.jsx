import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Properties from './pages/Properties';
import Agents from './pages/Agents';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PropertyDetail from './pages/PropertyDetail';
import ChatbotInfo from './pages/ChatbotInfo';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminProperties from './pages/admin/AdminProperties';
import AdminAgents from './pages/admin/AdminAgents';
import AdminMessages from './pages/admin/AdminMessages';
import AdminNewsletter from './pages/admin/AdminNewsletter';
import AdminSettings from './pages/admin/AdminSettings';
import NotFound from './pages/NotFound';

function Layout() {
  const location = useLocation();
  const noNav = ['/login', '/signup'];
  const isAdmin = location.pathname.startsWith('/admin');
  const showNav = !noNav.includes(location.pathname) && !isAdmin;

  return (
    <>
      <ScrollToTop />
      {showNav && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/:id" element={<PropertyDetail />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/chatbot-info" element={<ChatbotInfo />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* 404 */}
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
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      </AdminProvider>
    </AuthProvider>
  );
}
