import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { getAdminLockout, recordAdminLoginFailure, clearAdminLockout } from '../../utils/storage';

// After 5 failed logins the account is locked for 10 minutes. The counter is
// enforced server-side (see supabase/admin_lockout.sql) so it survives a page
// refresh, works across devices, and can't be reset from the browser. We keep
// the last-tried email in localStorage only so a refresh can re-query the lock
// and keep showing the countdown.
const LAST_EMAIL_KEY = 'terra_admin_last_email';

export default function AdminLogin() {

  const { adminLogin } = useAdmin();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lockUntil, setLockUntil] = useState(0);
  const [now, setNow] = useState(Date.now());

  const locked = lockUntil > now;

  // On load, re-check the lock for the last email tried on this device so the
  // countdown reappears after a refresh.
  useEffect(() => {
    const last = localStorage.getItem(LAST_EMAIL_KEY);
    if (last) getAdminLockout(last).then(s => { if (s.locked) setLockUntil(s.lockUntil); });
  }, []);

  // While locked, tick every second so the countdown updates and the form
  // re-enables the moment the lock expires.
  useEffect(() => {
    if (!lockUntil) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [lockUntil]);

  // Once the lock window passes, clear it locally so the form re-enables.
  useEffect(() => {
    if (lockUntil && now >= lockUntil) {
      setLockUntil(0);
      setError('');
    }
  }, [now, lockUntil]);

  const remainingMs = Math.max(0, lockUntil - now);
  const mm = Math.floor(remainingMs / 60000);
  const ss = Math.floor((remainingMs % 60000) / 1000);
  const countdown = `${mm}:${String(ss).padStart(2, '0')}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting || locked) return;
    setError('');
    setSubmitting(true);
    localStorage.setItem(LAST_EMAIL_KEY, username);

    // Authoritative check first — catches a lock set on another device or after
    // a refresh where the mount check hadn't run yet.
    const pre = await getAdminLockout(username);
    if (pre.locked) {
      setLockUntil(pre.lockUntil);
      setNow(Date.now());
      setSubmitting(false);
      return;
    }

    const ok = await adminLogin(username, password);
    if (ok) {
      await clearAdminLockout(username);
      localStorage.removeItem(LAST_EMAIL_KEY);
      navigate('/admin/dashboard');
      return;
    }

    const state = await recordAdminLoginFailure(username);
    if (state.locked) {
      setLockUntil(state.lockUntil);
      setNow(Date.now());
      setError('');
    } else {
      setError('Invalid credentials. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl text-white mb-2">Terra</h1>
          <p className="text-gray-500 text-xs uppercase tracking-[0.3em]">Admin Portal</p>
        </div>

        <div className="bg-[#1a1a1a] rounded-2xl p-8 shadow-2xl border border-white/5">
          <h2 className="text-white text-xl font-semibold mb-1">Sign In</h2>
          <p className="text-gray-500 text-sm mb-7">Access the admin dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                placeholder="Email"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-[#252525] border border-white/10 text-white rounded-xl pl-11 pr-4 py-3.5 outline-none focus:border-[#C0A067] transition text-sm placeholder:text-gray-600 disabled:opacity-60"
                disabled={submitting || locked}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#252525] border border-white/10 text-white rounded-xl pl-11 pr-4 py-3.5 outline-none focus:border-[#C0A067] transition text-sm placeholder:text-gray-600 disabled:opacity-60"
                disabled={submitting || locked}
                required
              />
            </div>

            {locked ? (
              <div className="text-amber-400 text-sm bg-amber-400/10 px-4 py-3 rounded-lg">
                Too many failed attempts. Please try again in{' '}
                <span className="font-semibold tabular-nums">{countdown}</span>.
              </div>
            ) : error ? (
              <p className="text-red-400 text-sm bg-red-400/10 px-4 py-2.5 rounded-lg">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={submitting || locked}
              className="w-full bg-[#C0A067] text-black font-semibold py-3.5 rounded-xl hover:bg-[#a98952] transition text-sm mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {locked ? `Locked — ${countdown}` : submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          <Link to="/" className="hover:text-gray-400 transition">← Back to website</Link>
        </p>
      </div>
    </div>
  );
}
