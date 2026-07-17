import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSupabase } from '../utils/supabaseClient';

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

  useEffect(() => {
    let active = true;
    let subscription;
    getSupabase().then((supabase) => {
      if (!active) return;
      supabase.auth.getSession().then(({ data: { session } }) => {
        setCurrentUser(toSessionUser(session?.user));
      });
      subscription = supabase.auth.onAuthStateChange((_event, session) => {
        setCurrentUser(toSessionUser(session?.user));
      }).data.subscription;
    });
    return () => { active = false; subscription?.unsubscribe(); };
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
    <AuthContext.Provider value={{ currentUser, registerUser, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
