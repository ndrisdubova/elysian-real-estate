import { useState, useRef, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Camera, X, Check, Link2, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMyProfile, upsertMyProfile } from '../utils/storage';
import { getSupabase } from '../utils/supabaseClient';
import Footer from '../components/Footer';
import Seo from '../components/Seo';

// Shrink the chosen photo in the browser to an avatar-sized WebP data URL so the
// stored value stays small (a few KB) instead of a multi-MB original.
function resizeToDataUrl(file, max = 256) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/webp', 0.85));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function Account() {
  const { currentUser, authReady, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [photoTab, setPhotoTab] = useState('upload'); // 'upload' | 'url'
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState('');

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState('');

  // Seed the form from the saved profile (falling back to the session values).
  useEffect(() => {
    if (!currentUser) return;
    setName(currentUser.name || '');
    setAvatar(currentUser.avatar || '');
    getMyProfile(currentUser.id).then((p) => {
      if (p?.name) setName(p.name);
      if (p?.avatar) setAvatar(p.avatar);
    });
  }, [currentUser]);

  if (!authReady) return null;
  if (!currentUser) return <Navigate to="/login" replace />;

  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setAvatar(await resizeToDataUrl(file));
    } catch {
      setProfileMsg('Could not read that image. Try another file.');
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg('');
    try {
      await upsertMyProfile(currentUser.id, { name: name.trim(), avatar });
      await refreshProfile();
      setProfileMsg('saved');
    } catch (err) {
      setProfileMsg(err.message || 'Could not save. Did you run the user_profiles migration?');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (!current) { setPwMsg('Enter your current password.'); return; }
    if (password.length < 6) { setPwMsg('New password must be at least 6 characters.'); return; }
    if (password !== confirm) { setPwMsg('New passwords do not match.'); return; }
    setSavingPw(true);
    setPwMsg('');
    try {
      const supabase = await getSupabase();
      // Verify the current password by re-authenticating before changing it.
      const { error: verifyErr } = await supabase.auth.signInWithPassword({
        email: currentUser.email,
        password: current,
      });
      if (verifyErr) { setPwMsg('Current password is incorrect.'); setSavingPw(false); return; }
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setCurrent('');
      setPassword('');
      setConfirm('');
      setPwMsg('saved');
    } catch (err) {
      setPwMsg(err.message || 'Could not update password.');
    } finally {
      setSavingPw(false);
    }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    setDeleteMsg('');
    try {
      const supabase = await getSupabase();
      const { error } = await supabase.rpc('delete_own_account');
      if (error) throw error;
      await supabase.auth.signOut();
      navigate('/', { replace: true });
    } catch (err) {
      setDeleteMsg(err.message || 'Could not delete account. Did you run the delete_own_account function?');
      setDeleting(false);
    }
  };

  const inputCls =
    'w-full px-4 py-3 rounded-xl border border-[#eee] bg-[#F5F5F5] outline-none text-base transition-all focus:border-soft-gold focus:bg-white focus:shadow-[0_0_0_3px_rgba(192,160,103,0.2)]';

  return (
    <>
      <Seo title="My Account" noindex />
      <main
        className="min-h-screen bg-ivory pt-28 md:pt-36 pb-20 px-4"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        <div className="max-w-xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl text-charcoal mb-2">My Account</h1>
          <p className="text-gray-500 mb-10">Manage your profile photo, name, and password.</p>

          {/* Profile card */}
          <form onSubmit={saveProfile} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="relative flex-shrink-0">
                <img
                  src={avatar || currentUser.avatar}
                  alt={name || currentUser.name}
                  className="w-28 h-28 rounded-full object-cover border-4 border-ivory shadow-md bg-gray-100"
                />
                <button
                  type="button"
                  onClick={() => { setPhotoTab('upload'); fileRef.current?.click(); }}
                  className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-soft-gold text-white flex items-center justify-center shadow-md hover:bg-dark-gold transition"
                  aria-label="Upload photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
              </div>

              <div className="w-full text-center sm:text-left">
                <p className="font-semibold text-charcoal text-lg">{name || currentUser.name}</p>
                <p className="text-gray-500 text-sm mb-3">{currentUser.email}</p>

                {/* Photo source: upload a file or paste an image URL */}
                <div className="flex gap-2 justify-center sm:justify-start">
                  <button
                    type="button"
                    onClick={() => setPhotoTab('upload')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${photoTab === 'upload' ? 'bg-soft-gold text-white border-soft-gold' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoTab('url')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${photoTab === 'url' ? 'bg-soft-gold text-white border-soft-gold' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                  >
                    <Link2 className="w-3.5 h-3.5" /> URL
                  </button>
                </div>

                {photoTab === 'url' ? (
                  <input
                    type="url"
                    value={avatar.startsWith('data:') ? '' : avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://image-address.jpg"
                    className={`${inputCls} mt-3`}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="mt-3 w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500 hover:border-soft-gold transition"
                  >
                    <Upload className="w-4 h-4" /> {avatar ? 'Change image' : 'Choose image'}
                  </button>
                )}

                {avatar && (
                  <button
                    type="button"
                    onClick={() => setAvatar('')}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
                  >
                    <X className="w-3.5 h-3.5" /> Remove photo
                  </button>
                )}
              </div>
            </div>

            <div className="mt-8">
              <label className="block text-sm text-gray-600 mb-1.5">Display name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={inputCls} />
            </div>

            <div className="mt-4">
              <label className="block text-sm text-gray-600 mb-1.5">Email</label>
              <input value={currentUser.email} disabled className={`${inputCls} opacity-60 cursor-not-allowed`} />
            </div>

            <div className="mt-6 flex items-center gap-4">
              <button
                type="submit"
                disabled={savingProfile}
                className="bg-charcoal text-ivory px-7 py-3 rounded-xl font-semibold hover:bg-soft-gold hover:text-charcoal transition disabled:opacity-60"
              >
                {savingProfile ? 'Saving…' : 'Save changes'}
              </button>
              {profileMsg === 'saved' ? (
                <span className="inline-flex items-center gap-1 text-green-600 text-sm"><Check className="w-4 h-4" /> Saved</span>
              ) : profileMsg ? (
                <span className="text-red-500 text-sm">{profileMsg}</span>
              ) : null}
            </div>
          </form>

          {/* Password card */}
          <form onSubmit={savePassword} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="font-display text-2xl text-charcoal mb-1">Change password</h2>
            <p className="text-gray-500 text-sm mb-6">Enter your current password, then choose a new one.</p>

            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Current password</label>
              <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="••••••••" autoComplete="current-password" className={inputCls} />
            </div>
            <div className="mt-4">
              <label className="block text-sm text-gray-600 mb-1.5">New password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" className={inputCls} />
            </div>
            <div className="mt-4">
              <label className="block text-sm text-gray-600 mb-1.5">Confirm new password</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" className={inputCls} />
            </div>

            <div className="mt-6 flex items-center gap-4">
              <button
                type="submit"
                disabled={savingPw || !password}
                className="bg-charcoal text-ivory px-7 py-3 rounded-xl font-semibold hover:bg-soft-gold hover:text-charcoal transition disabled:opacity-60"
              >
                {savingPw ? 'Updating…' : 'Update password'}
              </button>
              {pwMsg === 'saved' ? (
                <span className="inline-flex items-center gap-1 text-green-600 text-sm"><Check className="w-4 h-4" /> Password updated</span>
              ) : pwMsg ? (
                <span className="text-red-500 text-sm">{pwMsg}</span>
              ) : null}
            </div>
          </form>

          {/* Danger zone */}
          <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6 md:p-8 mt-8">
            <h2 className="font-display text-2xl text-red-600 mb-1">Delete account</h2>
            <p className="text-gray-500 text-sm mb-6">Permanently delete your account and profile. This cannot be undone.</p>
            <button
              onClick={() => { setDeleteMsg(''); setConfirmDelete(true); }}
              className="w-full sm:w-auto bg-red-500 text-white px-7 py-3 rounded-xl font-semibold hover:bg-red-600 transition"
            >
              Delete my account
            </button>
            {deleteMsg && <p className="text-red-500 text-sm mt-3">{deleteMsg}</p>}
          </div>

          <div className="text-center mt-8">
            <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-soft-gold text-sm transition">← Back</button>
          </div>
        </div>
      </main>
      <Footer />

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-7 w-full max-w-sm shadow-2xl">
            <h3 className="font-display text-2xl text-charcoal mb-2">Delete your account?</h3>
            <p className="text-sm text-gray-500 mb-6">
              This permanently removes your account, profile photo and saved data. This cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="flex-1 order-2 sm:order-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={deleteAccount}
                disabled={deleting}
                className="flex-1 order-1 sm:order-2 bg-red-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-red-600 transition disabled:opacity-60"
              >
                {deleting ? 'Deleting…' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
