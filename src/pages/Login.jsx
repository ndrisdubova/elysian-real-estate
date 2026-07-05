import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { loginUser, currentUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) navigate('/', { replace: true });
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await loginUser(email.trim(), password);
    if (!result.success) {
      setError(result.message);
    } else {
      navigate('/');
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-ivory relative px-4 py-20 overflow-y-auto"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Glow effects */}
      <div className="pointer-events-none absolute w-[400px] h-[400px] rounded-full top-[-100px] left-[-100px] blur-[80px]" style={{ background: 'rgba(192,160,103,0.15)' }} />
      <div className="pointer-events-none absolute w-[500px] h-[500px] rounded-full bottom-[-150px] right-[-150px] blur-[90px]" style={{ background: 'rgba(26,26,26,0.05)' }} />

      {/* Back button */}
      <div className="absolute top-7 left-7 z-10">
        <button onClick={() => navigate(-1)} className="text-charcoal bg-white/70 backdrop-blur-[10px] px-[18px] py-[10px] rounded-full border border-[#eee] text-sm transition-all hover:bg-soft-gold hover:text-white hover:-translate-y-0.5 shadow-md">
          ← Back
        </button>
      </div>

      <div className="flex flex-col items-center gap-6 z-10 w-full max-w-sm">
        <h1 className="text-[42px] font-display tracking-[2px] text-charcoal m-0">Terra</h1>

        <form className="login-box w-full" onSubmit={handleSubmit}>
          <h2 className="font-display text-center mb-6 text-[28px] tracking-[1px]">Welcome Back</h2>

          {error && <div className="login-error show">{error}</div>}

          <div className="mb-[18px]">
            <label className="block text-[13px] text-[#444] mb-[6px]">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-[15px] py-3 rounded-full border border-[#eee] bg-[#F5F5F5] outline-none text-base transition-all focus:border-soft-gold focus:bg-white focus:shadow-[0_0_0_3px_rgba(192,160,103,0.25)]"
            />
          </div>

          <div className="mb-[18px]">
            <label className="block text-[13px] text-[#444] mb-[6px]">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-[15px] py-3 rounded-full border border-[#eee] bg-[#F5F5F5] outline-none text-base transition-all focus:border-soft-gold focus:bg-white focus:shadow-[0_0_0_3px_rgba(192,160,103,0.25)]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-2 rounded-full bg-charcoal text-ivory text-[15px] cursor-pointer transition-all hover:bg-soft-gold hover:text-charcoal hover:-translate-y-0.5 border-none"
          >
            Login
          </button>

          <div className="text-center mt-4 text-[13px] text-[#666]">
            Don't have an account?{' '}
            <Link to="/signup" className="text-soft-gold no-underline hover:underline">Sign up</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
