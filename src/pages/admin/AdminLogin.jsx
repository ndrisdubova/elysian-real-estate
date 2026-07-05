import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export default function AdminLogin() {
  const { adminLogin } = useAdmin();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const ok = await adminLogin(username, password);
    if (ok) {
      navigate('/admin/dashboard');
    } else {
      setError('Invalid credentials. Please try again.');
    }
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
                className="w-full bg-[#252525] border border-white/10 text-white rounded-xl pl-11 pr-4 py-3.5 outline-none focus:border-[#C0A067] transition text-sm placeholder:text-gray-600"
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
                className="w-full bg-[#252525] border border-white/10 text-white rounded-xl pl-11 pr-4 py-3.5 outline-none focus:border-[#C0A067] transition text-sm placeholder:text-gray-600"
                required
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 px-4 py-2.5 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-[#C0A067] text-black font-semibold py-3.5 rounded-xl hover:bg-[#a98952] transition text-sm mt-2"
            >
              Sign In
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
