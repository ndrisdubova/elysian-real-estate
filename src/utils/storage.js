import { properties as defaultProperties } from '../data/properties';

const PROPS_KEY = 'elysian_properties';
const AGENTS_KEY = 'elysian_agents';
const MSGS_KEY = 'elysian_messages';
const SUBS_KEY = 'elysian_subscribers';
const ADMIN_SETTINGS_KEY = 'elysian_admin_settings';
const DEFAULT_ADMIN_SETTINGS = { accentColor: '#C0A067', theme: 'light' };

const DEFAULT_AGENTS = [
  { id: 1, name: 'Michael Chen', role: 'Co-Founder & CEO', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80', bio: 'Visionary behind global luxury expansion.', type: 'founder', languages: 'English, Mandarin, French', phone: '+1 (310) 555-0123', email: 'michael.chen@elysian.com' },
  { id: 2, name: 'Isabella Rossi', role: 'Co-Founder & Director', img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80', bio: 'Leads design & elite client experience.', type: 'founder', languages: 'English, Italian, Spanish', phone: '+1 (310) 555-0124', email: 'isabella.rossi@elysian.com' },
  { id: 3, name: 'Daniel Carter', role: 'Investment Consultant', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', bio: 'Specialist in high-yield investment portfolios.', type: 'expert', languages: 'English, German', phone: '+1 (310) 555-0125', email: 'daniel.carter@elysian.com' },
  { id: 4, name: 'Sophia Laurent', role: 'Architectural Advisor', img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80', bio: 'Expert in luxury design and architecture.', type: 'expert', languages: 'English, French', phone: '+1 (310) 555-0126', email: 'sophia.laurent@elysian.com' },
  { id: 5, name: 'James Walker', role: 'Market Analyst', img: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=400&q=80', bio: 'Provides deep market intelligence and trends.', type: 'expert', languages: 'English', phone: '+1 (310) 555-0127', email: 'james.walker@elysian.com' },
  { id: 6, name: 'Emily Stone', role: 'Luxury Property Strategist', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80', bio: 'Crafts bespoke property strategies for elite clients.', type: 'expert', languages: 'English, Portuguese', phone: '+1 (310) 555-0128', email: 'emily.stone@elysian.com' },
  { id: 7, name: 'Lucas Meyer', role: 'Real Estate Legal Advisor', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80', bio: 'Navigates complex legal frameworks globally.', type: 'expert', languages: 'English, German, Dutch', phone: '+1 (310) 555-0129', email: 'lucas.meyer@elysian.com' },
  { id: 8, name: 'Olivia Bennett', role: 'Client Relations Director', img: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=400&q=80', bio: 'Curates white-glove experiences for every client.', type: 'expert', languages: 'English, Arabic', phone: '+1 (310) 555-0130', email: 'olivia.bennett@elysian.com' },
];

export function getProperties() {
  try {
    const stored = localStorage.getItem(PROPS_KEY);
    if (stored) return JSON.parse(stored);
    const seeded = defaultProperties.map(p => ({ ...p, extraPhotos: [] }));
    localStorage.setItem(PROPS_KEY, JSON.stringify(seeded));
    return seeded;
  } catch {
    return defaultProperties.map(p => ({ ...p, extraPhotos: [] }));
  }
}

export function saveProperties(props) {
  localStorage.setItem(PROPS_KEY, JSON.stringify(props));
}

export function getAgents() {
  try {
    const stored = localStorage.getItem(AGENTS_KEY);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(AGENTS_KEY, JSON.stringify(DEFAULT_AGENTS));
    return DEFAULT_AGENTS;
  } catch {
    return DEFAULT_AGENTS;
  }
}

export function saveAgents(agents) {
  localStorage.setItem(AGENTS_KEY, JSON.stringify(agents));
}

export function getMessages() {
  try {
    const stored = localStorage.getItem(MSGS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveMessages(msgs) {
  localStorage.setItem(MSGS_KEY, JSON.stringify(msgs));
}

export function addMessage(fields) {
  const msgs = getMessages();
  const msg = { ...fields, id: Date.now().toString(), date: new Date().toISOString() };
  msgs.unshift(msg);
  saveMessages(msgs);
}

const FAVS_KEY = 'elysian_favorites';

export function getFavorites() {
  try {
    const stored = localStorage.getItem(FAVS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function toggleFavorite(id) {
  const favs = getFavorites();
  const updated = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id];
  localStorage.setItem(FAVS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('favoritesUpdated'));
  return updated;
}

export function getSubscribers() {
  try {
    const stored = localStorage.getItem(SUBS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveSubscribers(subs) {
  localStorage.setItem(SUBS_KEY, JSON.stringify(subs));
}

export function addSubscriber(email) {
  const subs = getSubscribers();
  if (subs.some(s => s.email.toLowerCase() === email.toLowerCase())) return subs;
  const updated = [{ id: Date.now().toString(), email, date: new Date().toISOString() }, ...subs];
  saveSubscribers(updated);
  return updated;
}

export function getAdminSettings() {
  try {
    const stored = localStorage.getItem(ADMIN_SETTINGS_KEY);
    return stored ? { ...DEFAULT_ADMIN_SETTINGS, ...JSON.parse(stored) } : { ...DEFAULT_ADMIN_SETTINGS };
  } catch {
    return { ...DEFAULT_ADMIN_SETTINGS };
  }
}

export function saveAdminSettings(settings) {
  localStorage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify(settings));
}
