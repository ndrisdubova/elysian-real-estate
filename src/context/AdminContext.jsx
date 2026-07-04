import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

const AdminContext = createContext(null);

async function checkIsAdmin(userId) {
  const { data } = await supabase.from('profiles').select('is_admin').eq('id', userId).single();
  return !!data?.is_admin;
}

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setIsAdmin(session?.user ? await checkIsAdmin(session.user.id) : false);
      setReady(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsAdmin(session?.user ? await checkIsAdmin(session.user.id) : false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const adminLogin = async (email, password) => {
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
