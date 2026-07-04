import { supabase } from './supabaseClient';

const ADMIN_SETTINGS_KEY = 'elysian_admin_settings';
const MSGS_SEEN_KEY = 'elysian_messages_seen_at';
const SUBS_SEEN_KEY = 'elysian_subscribers_seen_at';
const DEFAULT_ADMIN_SETTINGS = { accentColor: '#C0A067', theme: 'light' };

const mapProperty = (row) => ({ ...row, extraPhotos: row.extra_photos });
const unmapProperty = ({ extraPhotos, ...fields }) => ({ ...fields, extra_photos: extraPhotos || [] });

export async function getProperties() {
  const { data, error } = await supabase.from('properties').select('*').order('id');
  if (error) { console.error(error); return []; }
  return data.map(mapProperty);
}

export async function addProperty(fields) {
  const { data, error } = await supabase.from('properties').insert(unmapProperty(fields)).select().single();
  if (error) throw error;
  return mapProperty(data);
}

export async function updateProperty(id, fields) {
  const { data, error } = await supabase.from('properties').update(unmapProperty(fields)).eq('id', id).select().single();
  if (error) throw error;
  return mapProperty(data);
}

export async function deleteProperty(id) {
  const { error } = await supabase.from('properties').delete().eq('id', id);
  if (error) throw error;
}

export async function getAgents() {
  const { data, error } = await supabase.from('agents').select('*').order('id');
  if (error) { console.error(error); return []; }
  return data;
}

export async function addAgent(fields) {
  const { data, error } = await supabase.from('agents').insert(fields).select().single();
  if (error) throw error;
  return data;
}

export async function updateAgent(id, fields) {
  const { data, error } = await supabase.from('agents').update(fields).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteAgent(id) {
  const { error } = await supabase.from('agents').delete().eq('id', id);
  if (error) throw error;
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
  const { data, error } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return data.map(mapMessage);
}

export async function addMessage(fields) {
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
  const { error } = await supabase.from('messages').delete().eq('id', id);
  if (error) throw error;
}

export async function getUnreadMessagesCount() {
  const seenAt = new Date(Number(localStorage.getItem(MSGS_SEEN_KEY) || 0)).toISOString();
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
  const { data, error } = await supabase.from('favorites').select('property_id').eq('user_id', userId);
  if (error) { console.error(error); return []; }
  return data.map(r => r.property_id);
}

export async function toggleFavorite(userId, propertyId) {
  if (!userId) return [];
  const current = await getFavorites(userId);
  const isFavorited = current.includes(propertyId);
  if (isFavorited) {
    await supabase.from('favorites').delete().eq('user_id', userId).eq('property_id', propertyId);
  } else {
    await supabase.from('favorites').insert({ user_id: userId, property_id: propertyId });
  }
  window.dispatchEvent(new Event('favoritesUpdated'));
  return isFavorited ? current.filter(id => id !== propertyId) : [...current, propertyId];
}

const mapSubscriber = (row) => ({ id: row.id, email: row.email, date: row.created_at });

export async function getSubscribers() {
  const { data, error } = await supabase.from('subscribers').select('*').order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return data.map(mapSubscriber);
}

export async function addSubscriber(email) {
  const { error } = await supabase.from('subscribers').insert({ email });
  if (error && error.code !== '23505') throw error; // ignore duplicate email
  window.dispatchEvent(new Event('subscribersUpdated'));
}

export async function deleteSubscriber(id) {
  const { error } = await supabase.from('subscribers').delete().eq('id', id);
  if (error) throw error;
}

export async function getUnreadSubscribersCount() {
  const seenAt = new Date(Number(localStorage.getItem(SUBS_SEEN_KEY) || 0)).toISOString();
  const { count, error } = await supabase.from('subscribers').select('*', { count: 'exact', head: true }).gt('created_at', seenAt);
  if (error) { console.error(error); return 0; }
  return count || 0;
}

export function markSubscribersSeen() {
  localStorage.setItem(SUBS_SEEN_KEY, Date.now().toString());
  window.dispatchEvent(new Event('subscribersUpdated'));
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
