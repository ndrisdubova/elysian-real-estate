import { createContext, useContext, useState, useEffect } from 'react';
import { getSupabase } from '../utils/supabaseClient';

const AdminContext = createContext(null);

// Login triggers a manual checkIsAdmin call *and* one from the onAuthStateChange
// listener below for the same user at nearly the same time. Share one in-flight
// request between them instead of making the user wait on two round-trips.
const adminCheckCache = new Map();

async function checkIsAdmin(userId) {
  if (!adminCheckCache.has(userId)) {
    const request = getSupabase()
      .then((supabase) => supabase.from('profiles').select('is_admin').eq('id', userId).single())
      .then(({ data }) => !!data?.is_admin)
      .catch(() => false);
    adminCheckCache.set(userId, request);
    request.finally(() => setTimeout(() => adminCheckCache.delete(userId), 2000));
  }
  return adminCheckCache.get(userId);
}

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    let subscription;
    let current = 0;
    getSupabase().then((supabase) => {
      if (!active) return;
      subscription = supabase.auth.onAuthStateChange(async (_event, session) => {
        const request = ++current;
        const admin = session?.user ? await checkIsAdmin(session.user.id) : false;
        if (request !== current) return; // a newer auth event superseded this one
        setIsAdmin(admin);
        setReady(true);
      }).data.subscription;
    });

    return () => { active = false; subscription?.unsubscribe(); };
  }, []);

  const adminLogin = async (email, password) => {
    const supabase = await getSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return false;
    const admin = await checkIsAdmin(data.user.id);
    if (!admin) {
      await supabase.auth.signOut();
      return false;
    }
    setIsAdmin(true);
    return true;
  };

  const adminLogout = async () => {
    const supabase = await getSupabase();
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  return (
    <AdminContext.Provider value={{ isAdmin, ready, adminLogin, adminLogout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
