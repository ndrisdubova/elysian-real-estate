import { createContext, useContext, useState, useCallback } from 'react';

const USERS_KEY = 'elysian_users';
const SESSION_KEY = 'elysian_currentUser';

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch { return []; }
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function getStoredUser() {
  try {
    const d = localStorage.getItem(SESSION_KEY);
    return d ? JSON.parse(d) : null;
  } catch { return null; }
}
function generateAvatar(name, email) {
  const display = (name || email.split('@')[0]).trim();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(display)}&background=C0A067&color=fff&size=128&bold=true`;
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(getStoredUser);

  const registerUser = useCallback(({ name, email, password }) => {
    const users = getUsers();
    const norm = email.toLowerCase().trim();
    if (users.some(u => u.email.toLowerCase() === norm)) {
      return { success: false, message: 'An account with this email already exists.' };
    }
    const user = { name: name.trim(), email: norm, password, avatar: generateAvatar(name, email) };
    users.push(user);
    saveUsers(users);
    return { success: true, user };
  }, []);

  const loginUser = useCallback((email, password) => {
    const users = getUsers();
    const norm = email.toLowerCase().trim();
    const found = users.find(u => u.email.toLowerCase() === norm && u.password === password);
    if (!found) return { success: false, message: 'Invalid email or password.' };
    const session = { name: found.name, email: found.email, avatar: found.avatar };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setCurrentUser(session);
    return { success: true, user: session };
  }, []);

  const logoutUser = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
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
