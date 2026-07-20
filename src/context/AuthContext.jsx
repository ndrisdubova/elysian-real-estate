import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSupabase } from '../utils/supabaseClient';
import { getMyProfile } from '../utils/storage';

function generateAvatar(name, email) {
  const display = (name || email.split('@')[0]).trim();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(display)}&background=C0A067&color=fff&size=128&bold=true`;
}

function toSessionUser(user) {
  if (!user) return null;
  const name = user.user_metadata?.name || user.email.split('@')[0];
  return { id: user.id, name, email: user.email, avatar: generateAvatar(name, user.email) };
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let active = true;
    let subscription;

    // Show the base session user immediately, then swap in the custom display
    // name / avatar from the user_profiles table once it loads (if any).
    const load = async (session) => {
      const base = toSessionUser(session?.user);
      if (active) { setCurrentUser(base); setAuthReady(true); }
      if (!base) return;
      const profile = await getMyProfile(base.id).catch(() => null);
      if (active && profile) {
        setCurrentUser({ ...base, name: profile.name || base.name, avatar: profile.avatar || base.avatar });
      }
    };

    getSupabase().then((supabase) => {
      if (!active) return;
      supabase.auth.getSession().then(({ data: { session } }) => load(session));
      subscription = supabase.auth.onAuthStateChange((_event, session) => {
        // Defer: load() runs a DB query, and awaiting one synchronously inside
        // this callback deadlocks supabase-js's auth lock.
        setTimeout(() => load(session), 0);
      }).data.subscription;
    });
    return () => { active = false; subscription?.unsubscribe(); };
  }, []);

  // Re-fetch the profile after the account page saves changes, so the navbar
  // avatar/name update immediately without a page reload.
  const refreshProfile = useCallback(async () => {
    const supabase = await getSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    const base = toSessionUser(session?.user);
    if (!base) { setCurrentUser(null); return; }
    const profile = await getMyProfile(base.id).catch(() => null);
    setCurrentUser({ ...base, name: profile?.name || base.name, avatar: profile?.avatar || base.avatar });
  }, []);

  const registerUser = useCallback(async ({ name, email, password }) => {
    const supabase = await getSupabase();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { name: name.trim() } },
    });
    if (error) return { success: false, message: error.message };
    return { success: true, user: toSessionUser(data.user), needsConfirmation: !data.session };
  }, []);

  const loginUser = useCallback(async (email, password) => {
    const supabase = await getSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { success: false, message: 'Invalid email or password.' };
    return { success: true, user: toSessionUser(data.user) };
  }, []);

  const logoutUser = useCallback(async () => {
    const supabase = await getSupabase();
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, authReady, registerUser, loginUser, logoutUser, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
