import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, Outlet, Navigate } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, MessageSquare, Mail, Settings, LogOut, Menu, X, ChevronDown } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { supabase } from '../../utils/supabaseClient';
import {
  getAdminSettings, saveAdminSettings,
  getUnreadMessagesCount, markMessagesSeen,
  getUnreadSubscribersCount, markSubscribersSeen,
} from '../../utils/storage';

const NAV = [
  { path: '/admin/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { path: '/admin/properties', label: 'Properties', Icon: Building2 },
  { path: '/admin/agents', label: 'Agents', Icon: Users },
  { path: '/admin/messages', label: 'Messages', Icon: MessageSquare, badgeKey: 'messages' },
  { path: '/admin/newsletter', label: 'Newsletter', Icon: Mail, badgeKey: 'newsletter' },
];

export default function AdminLayout() {
  const { isAdmin, ready, adminLogout } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accentColor, setAccentColorState] = useState(() => getAdminSettings().accentColor);
  const [theme, setThemeState] = useState(() => getAdminSettings().theme);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNewsletter, setUnreadNewsletter] = useState(0);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const refresh = () => {
      getUnreadMessagesCount().then(setUnreadMessages);
      getUnreadSubscribersCount().then(setUnreadNewsletter);
    };
    refresh();
    window.addEventListener('messagesUpdated', refresh);
    window.addEventListener('subscribersUpdated', refresh);
    window.addEventListener('storage', refresh);

    const channel = supabase
      .channel('admin-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, refresh)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'subscribers' }, refresh)
      .subscribe();

    return () => {
      window.removeEventListener('messagesUpdated', refresh);
      window.removeEventListener('subscribersUpdated', refresh);
      window.removeEventListener('storage', refresh);
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (location.pathname === '/admin/messages') markMessagesSeen();
    if (location.pathname === '/admin/newsletter') markSubscribersSeen();
  }, [location.pathname]);

  if (!ready) return null;
  if (!isAdmin) return <Navigate to="/admin/login" replace />;

  const handleLogout = async () => {
    await adminLogout();
    navigate('/admin/login');
  };

  const setAccentColor = (color) => {
    setAccentColorState(color);
    saveAdminSettings({ accentColor: color, theme });
  };

  const setTheme = (value) => {
    setThemeState(value);
    saveAdminSettings({ accentColor, theme: value });
  };

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div
        className="flex h-screen bg-[#f5f5f5] dark:bg-[#0f0f0f] overflow-hidden"
        style={{ '--admin-accent': accentColor, '--admin-accent-dark': `color-mix(in srgb, ${accentColor} 80%, black)` }}
      >
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#141414] text-white flex flex-col
            transition-transform duration-300 lg:translate-x-0 lg:static lg:flex
            ${open ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="px-6 py-7 border-b border-white/10">
            <Link to="/" className="font-display text-2xl font-bold tracking-wide">Elysian</Link>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-[0.25em]">Admin Panel</p>
          </div>

          <nav className="flex-1 px-3 py-6 space-y-0.5">
            {NAV.map(({ path, label, Icon, badgeKey }) => {
              const active = location.pathname === path;
              const unread = badgeKey === 'messages' ? unreadMessages : badgeKey === 'newsletter' ? unreadNewsletter : 0;
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${active ? 'bg-[var(--admin-accent)] text-black' : 'text-gray-400 dark:text-gray-500 hover:text-white hover:bg-white/5'}`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="w-4.5 h-4.5 w-5 h-5" />
                    {label}
                  </span>
                  {unread > 0 && (
                    <span className={`flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-[11px] font-bold
                      ${active ? 'bg-black/20 text-black' : 'bg-red-500 text-white'}`}>
                      {unread > 99 ? '99+' : unread}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="px-3 pb-6 border-t border-white/10 pt-4">
            <div className="flex items-center gap-3 px-4 mb-3">
              <div className="w-8 h-8 bg-[var(--admin-accent)] rounded-full flex items-center justify-center text-black font-bold text-sm flex-shrink-0">A</div>
              <div>
                <p className="text-white text-sm font-medium">Admin</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">Administrator</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-gray-400 dark:text-gray-500 hover:text-red-400 hover:bg-red-400/5 rounded-xl text-sm font-medium transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </aside>

        {open && (
          <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setOpen(false)} />
        )}

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <header className="bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-white/10 px-6 py-4 flex items-center gap-4">
            <button className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200" onClick={() => setOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative ml-auto" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition"
              >
                <div className="w-8 h-8 bg-[var(--admin-accent)] rounded-full flex items-center justify-center text-black font-bold text-sm">A</div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">Admin</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-lg border border-gray-100 dark:border-white/10 py-1.5 z-50">
                  <Link
                    to="/admin/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition"
                  >
                    <Settings className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6">
            <Outlet context={{ accentColor, setAccentColor, theme, setTheme }} />
          </main>
        </div>
      </div>
    </div>
  );
}
