import { createContext, useContext, useState } from 'react';

const AdminContext = createContext(null);
const ADMIN_KEY = 'elysian_admin_session';

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem(ADMIN_KEY) === 'true');

  const adminLogin = (username, password) => {
    if (username === 'admin@elysian.com' && password === 'admin123') {
      localStorage.setItem(ADMIN_KEY, 'true');
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    localStorage.removeItem(ADMIN_KEY);
    setIsAdmin(false);
  };

  return (
    <AdminContext.Provider value={{ isAdmin, adminLogin, adminLogout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
