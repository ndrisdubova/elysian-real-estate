import { getSupabase } from './supabaseClient';

const ADMIN_SETTINGS_KEY = 'terra_admin_settings';
const MSGS_SEEN_KEY = 'terra_messages_seen_at';
const SUBS_SEEN_KEY = 'terra_subscribers_seen_at';
const DEFAULT_ADMIN_SETTINGS = { accentColor: '#C0A067', theme: 'light' };

// Serve smaller, modern-format images by appending sizing params to Unsplash
// URLs at read time (no DB change). Non-Unsplash URLs and URLs that already have
// params are left untouched, so future uploads (e.g. Supabase Storage) are safe.
function optimizeImg(url, w = 800) {
  if (typeof url !== 'string' || !url.includes('images.unsplash.com')) return url;
  if (url.includes('?')) return url;
  return `${url}?auto=format&fit=crop&w=${w}&q=70`;
}

const mapProperty = (row) => ({
  ...row,
  img: optimizeImg(row.img),
  extraPhotos: (row.extra_photos || []).map((u) => optimizeImg(u)),
});
const unmapProperty = ({ extraPhotos, ...fields }) => ({ ...fields, extra_photos: extraPhotos || [] });

let propertiesCache = null;
let propertiesPromise = null;

export async function getProperties() {
  if (propertiesCache) return propertiesCache;
  if (!propertiesPromise) {
    propertiesPromise = getSupabase()
      .then((sb) => sb.from('properties').select('*').order('id'))
      .then(({ data, error }) => {
        propertiesPromise = null;
        if (error) { console.error(error); return []; }
        propertiesCache = data.map(mapProperty);
        return propertiesCache;
      });
  }
  return propertiesPromise;
}

export async function addProperty(fields) {
  const supabase = await getSupabase();
  const { data, error } = await supabase.from('properties').insert(unmapProperty(fields)).select().single();
  if (error) throw error;
  propertiesCache = null;
  return mapProperty(data);
}

export async function updateProperty(id, fields) {
  const supabase = await getSupabase();
  const { data, error } = await supabase.from('properties').update(unmapProperty(fields)).eq('id', id).select().single();
  if (error) throw error;
  propertiesCache = null;
  return mapProperty(data);
}

export async function deleteProperty(id) {
  const supabase = await getSupabase();
  const { error } = await supabase.from('properties').delete().eq('id', id);
  if (error) throw error;
  propertiesCache = null;
}

let agentsCache = null;
let agentsPromise = null;

export async function getAgents() {
  if (agentsCache) return agentsCache;
  if (!agentsPromise) {
    agentsPromise = getSupabase()
      .then((sb) => sb.from('agents').select('*').order('id'))
      .then(({ data, error }) => {
        agentsPromise = null;
        if (error) { console.error(error); return []; }
        agentsCache = data;
        return agentsCache;
      });
  }
  return agentsPromise;
}

export async function addAgent(fields) {
  const supabase = await getSupabase();
  const { data, error } = await supabase.from('agents').insert(fields).select().single();
  if (error) throw error;
  agentsCache = null;
  return data;
}

export async function updateAgent(id, fields) {
  const supabase = await getSupabase();
  const { data, error } = await supabase.from('agents').update(fields).eq('id', id).select().single();
  if (error) throw error;
  agentsCache = null;
  return data;
}

export async function deleteAgent(id) {
  const supabase = await getSupabase();
  const { error } = await supabase.from('agents').delete().eq('id', id);
  if (error) throw error;
  agentsCache = null;
}

const mapMessage = (row) => ({
  id: row.id,
  firstName: row.first_name,
  lastName: row.last_name,
  email: row.email,
  phone: row.phone,
  subject: row.subject,
  message: row.message,
  property: row.property,
  propertyImg: row.property_img,
  date: row.created_at,
});

export async function getMessages() {
  const supabase = await getSupabase();
  const { data, error } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return data.map(mapMessage);
}

export async function addMessage(fields) {
  const supabase = await getSupabase();
  const { error } = await supabase.from('messages').insert({
    first_name: fields.firstName,
    last_name: fields.lastName,
    email: fields.email,
    phone: fields.phone,
    subject: fields.subject,
    message: fields.message,
    property: fields.property,
    property_img: fields.propertyImg,
  });
  if (error) throw error;
  window.dispatchEvent(new Event('messagesUpdated'));
}

export async function deleteMessage(id) {
  const supabase = await getSupabase();
  const { error } = await supabase.from('messages').delete().eq('id', id);
  if (error) throw error;
}

export async function getUnreadMessagesCount() {
  const seenAt = new Date(Number(localStorage.getItem(MSGS_SEEN_KEY) || 0)).toISOString();
  const supabase = await getSupabase();
  const { count, error } = await supabase.from('messages').select('*', { count: 'exact', head: true }).gt('created_at', seenAt);
  if (error) { console.error(error); return 0; }
  return count || 0;
}

export function markMessagesSeen() {
  localStorage.setItem(MSGS_SEEN_KEY, Date.now().toString());
  window.dispatchEvent(new Event('messagesUpdated'));
}

export async function getFavorites(userId) {
  if (!userId) return [];
  const supabase = await getSupabase();
  const { data, error } = await supabase.from('favorites').select('property_id').eq('user_id', userId);
  if (error) { console.error(error); return []; }
  return data.map(r => r.property_id);
}

export async function toggleFavorite(userId, propertyId, current) {
  if (!userId) return [];
  const supabase = await getSupabase();
  const isFavorited = current.includes(propertyId);
  const { error } = isFavorited
    ? await supabase.from('favorites').delete().eq('user_id', userId).eq('property_id', propertyId)
    : await supabase.from('favorites').insert({ user_id: userId, property_id: propertyId });
  if (error) throw error;
  return isFavorited ? current.filter(id => id !== propertyId) : [...current, propertyId];
}

const mapSubscriber = (row) => ({ id: row.id, email: row.email, date: row.created_at });

export async function getSubscribers() {
  const supabase = await getSupabase();
  const { data, error } = await supabase.from('subscribers').select('*').order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return data.map(mapSubscriber);
}

export async function addSubscriber(email) {
  const supabase = await getSupabase();
  const { error } = await supabase.from('subscribers').insert({ email });
  if (error && error.code !== '23505') throw error; // ignore duplicate email
  window.dispatchEvent(new Event('subscribersUpdated'));
}

export async function deleteSubscriber(id) {
  const supabase = await getSupabase();
  const { error } = await supabase.from('subscribers').delete().eq('id', id);
  if (error) throw error;
}

export async function getUnreadSubscribersCount() {
  const seenAt = new Date(Number(localStorage.getItem(SUBS_SEEN_KEY) || 0)).toISOString();
  const supabase = await getSupabase();
  const { count, error } = await supabase.from('subscribers').select('*', { count: 'exact', head: true }).gt('created_at', seenAt);
  if (error) { console.error(error); return 0; }
  return count || 0;
}

export function markSubscribersSeen() {
  localStorage.setItem(SUBS_SEEN_KEY, Date.now().toString());
  window.dispatchEvent(new Event('subscribersUpdated'));
}

// --- maintenance mode (global, shared across all visitors) -----------------
// Backed by a single-row `app_settings` table (id = 1). Readable by everyone
// so the public site knows whether to show the maintenance page; writable only
// by admins (enforced by Supabase RLS).

export async function getMaintenanceMode() {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('app_settings')
    .select('maintenance_mode')
    .eq('id', 1)
    .maybeSingle();
  if (error) { console.error(error); return false; }
  return !!data?.maintenance_mode;
}

export async function setMaintenanceMode(enabled) {
  const supabase = await getSupabase();
  const { error } = await supabase
    .from('app_settings')
    .update({ maintenance_mode: enabled, updated_at: new Date().toISOString() })
    .eq('id', 1);
  if (error) throw error;
}

// --- user profile (display name + avatar for the logged-in visitor) ----------

export async function getMyProfile(userId) {
  if (!userId) return null;
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('user_profiles')
    .select('name, avatar')
    .eq('id', userId)
    .maybeSingle();
  if (error) { console.error(error); return null; }
  return data;
}

export async function upsertMyProfile(userId, fields) {
  if (!userId) throw new Error('Not signed in');
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({ id: userId, ...fields, updated_at: new Date().toISOString() })
    .select('name, avatar')
    .single();
  if (error) throw error;
  return data;
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
