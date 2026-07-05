import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { registerUser, loginUser, currentUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [popup, setPopup] = useState('');

  useEffect(() => {
    if (currentUser) navigate('/', { replace: true });
  }, [currentUser, navigate]);

  const showPopup = (msg) => {
    setPopup(msg);
    setTimeout(() => setPopup(''), 2500);
  };

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Enter your full name';
    if (!form.email.includes('@')) errs.email = 'Enter a valid email';
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const result = await registerUser({ name: form.name, email: form.email, password: form.password });
    if (!result.success) { showPopup(result.message); return; }

    if (result.needsConfirmation) {
      showPopup('Check your email to confirm your account, then log in.');
      setTimeout(() => navigate('/login'), 2500);
      return;
    }

    await loginUser(form.email, form.password);
    showPopup('Account created');
    setTimeout(() => navigate('/'), 1500);
  };

  const inputClass = "w-full px-[15px] py-3 rounded-full border border-[#eee] bg-[#F5F5F5] outline-none text-base transition-all focus:border-soft-gold focus:bg-white focus:shadow-[0_0_0_3px_rgba(192,160,103,0.25)]";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-ivory relative px-4 py-20 overflow-y-auto"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Glow effects */}
      <div className="pointer-events-none absolute w-[420px] h-[420px] rounded-full top-[-120px] left-[-120px] blur-[85px]" style={{ background: 'rgba(192,160,103,0.18)' }} />
      <div className="pointer-events-none absolute w-[520px] h-[520px] rounded-full bottom-[-160px] right-[-160px] blur-[95px]" style={{ background: 'rgba(26,26,26,0.06)' }} />

      {/* Popup */}
      {popup && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-charcoal text-ivory px-5 py-3 rounded-full text-sm z-[999] transition-all">
          {popup}
        </div>
      )}

      {/* Back button */}
      <div className="absolute top-7 left-7 z-10">
        <button onClick={() => navigate(-1)} className="text-charcoal bg-white/70 backdrop-blur-[10px] px-[18px] py-[10px] rounded-full border border-[#eee] text-sm transition-all hover:bg-soft-gold hover:text-white hover:-translate-y-0.5 shadow-md">
          ← Back
        </button>
      </div>

      <div className="flex flex-col items-center gap-5 z-10 w-full max-w-sm">
        <h1 className="text-[42px] font-display tracking-[2px] text-charcoal m-0">Terra</h1>

        <form className="signup-box w-full" onSubmit={handleSubmit}>
          <h2 className="font-display text-center mb-6 text-[28px]">Create Account</h2>

          {[
            { field: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name', errKey: 'name' },
            { field: 'email', label: 'Email', type: 'email', placeholder: 'Your email address', errKey: 'email' },
            { field: 'password', label: 'Password', type: 'password', placeholder: 'At least 8 characters', errKey: 'password' },
            { field: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: 'Repeat your password', errKey: 'confirmPassword' },
          ].map(({ field, label, type, placeholder, errKey }) => (
            <div key={field} className="mb-4">
              <label className="block text-[13px] text-[#444] mb-[6px]">{label}</label>
              <input
                type={type}
                name={field}
                value={form[field]}
                onChange={handleChange}
                placeholder={placeholder}
                autoComplete="off"
                className={inputClass}
              />
              {errors[errKey] && <p className="text-[12px] text-red-600 mt-1">{errors[errKey]}</p>}
            </div>
          ))}

          <button
            type="submit"
            className="w-full py-3 mt-2 rounded-full bg-charcoal text-ivory text-[15px] cursor-pointer transition-all hover:bg-soft-gold hover:text-charcoal hover:-translate-y-0.5 border-none"
          >
            Sign Up
          </button>

          <div className="text-center mt-4 text-[13px] text-[#666]">
            Already have an account?{' '}
            <Link to="/login" className="text-soft-gold no-underline hover:underline">Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
