import { useState, useEffect } from 'react';
import { Trash2, MessageSquare, X, Phone, Building2, Bot, Home, Mail, MailOpen, CheckCheck } from 'lucide-react';
import { getMessages, deleteMessage, markMessageRead, markAllMessagesRead } from '../../utils/storage';

function InquiryBadge({ msg }) {
  if (msg.property) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-accent)] bg-[color-mix(in_srgb,var(--admin-accent)_10%,transparent)] px-2 py-0.5 rounded-full">
        <Building2 className="w-2.5 h-2.5" /> Property Inquiry
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-full">
      <MessageSquare className="w-2.5 h-2.5" /> General Inquiry
    </span>
  );
}

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => { getMessages().then(setMessages); }, []);

  const deleteMsg = async (id, e) => {
    e?.stopPropagation();
    if (selected?.id === id) setSelected(null);
    await deleteMessage(id);
    setMessages(list => list.filter(m => m.id !== id));
  };

  // Opening a message marks it read (optimistic UI, then persist to the DB).
  const openMessage = (msg) => {
    setSelected({ ...msg, read: true });
    if (!msg.read) {
      setMessages(list => list.map(m => (m.id === msg.id ? { ...m, read: true } : m)));
      markMessageRead(msg.id, true).catch(() => {});
    }
  };

  const setRead = (msg, read, e) => {
    e?.stopPropagation();
    setMessages(list => list.map(m => (m.id === msg.id ? { ...m, read } : m)));
    if (selected?.id === msg.id) setSelected(s => ({ ...s, read }));
    markMessageRead(msg.id, read).catch(() => {});
  };

  const markAllRead = () => {
    setMessages(list => list.map(m => ({ ...m, read: true })));
    markAllMessagesRead().catch(() => {});
  };

  const displayName = (m) => m.firstName ? `${m.firstName} ${m.lastName || ''}`.trim() : (m.name || 'Unknown');
  const initials = (m) => displayName(m).split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  const unreadCount = messages.filter(m => !m.read).length;

  const chatbotMsgs = messages.filter(m => m.subject === 'Chatbot Inquiry');
  const propertyMsgs = messages.filter(m => m.subject !== 'Chatbot Inquiry' && m.property);
  const generalMsgs = messages.filter(m => m.subject !== 'Chatbot Inquiry' && !m.property);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {messages.length} total
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-[var(--admin-accent)] font-semibold">
                · {unreadCount} unread
              </span>
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition"
          >
            <CheckCheck className="w-4 h-4" /> Mark all as read
          </button>
        )}
      </div>

      {messages.length === 0 ? (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 p-16 text-center">
          <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 dark:text-gray-500 text-sm">No messages yet. Enquiries from visitors will appear here.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {[
            { label: 'General Inquiries', Icon: MessageSquare, list: generalMsgs },
            { label: 'Property Inquiries', Icon: Home, list: propertyMsgs },
            { label: 'Chatbot Inquiries', Icon: Bot, list: chatbotMsgs },
          ].map(({ label, Icon, list }) => list.length > 0 && (
            <div key={label}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</h2>
                <span className="text-xs text-gray-400 dark:text-gray-500">({list.length})</span>
                {list.filter(m => !m.read).length > 0 && (
                  <span className="text-[10px] font-bold text-[var(--admin-accent)] bg-[color-mix(in_srgb,var(--admin-accent)_15%,transparent)] px-2 py-0.5 rounded-full">
                    {list.filter(m => !m.read).length} new
                  </span>
                )}
              </div>
              <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden">
                <div className="divide-y divide-gray-50 dark:divide-white/5">
                  {list.map(msg => (
                    <div
                      key={msg.id}
                      onClick={() => openMessage(msg)}
                      className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 transition cursor-pointer ${msg.read ? 'hover:bg-gray-50 dark:hover:bg-white/5' : 'bg-[color-mix(in_srgb,var(--admin-accent)_7%,transparent)] hover:bg-[color-mix(in_srgb,var(--admin-accent)_12%,transparent)]'}`}
                    >
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${msg.read ? 'bg-transparent' : 'bg-[var(--admin-accent)]'}`} aria-hidden="true" />
                      {msg.propertyImg ? (
                        <img
                          src={msg.propertyImg}
                          alt={msg.property}
                          className="w-12 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-100 dark:border-white/10"
                        />
                      ) : (
                        <div className="w-12 h-10 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-400 flex-shrink-0">
                          {initials(msg)}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm truncate ${msg.read ? 'font-medium text-gray-700 dark:text-gray-300' : 'font-bold text-gray-900 dark:text-white'}`}>
                            {displayName(msg)}
                          </span>
                          {!msg.read && (
                            <span className="text-[9px] font-bold uppercase tracking-wide text-[var(--admin-accent)] bg-[color-mix(in_srgb,var(--admin-accent)_15%,transparent)] px-1.5 py-0.5 rounded-full flex-shrink-0">New</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <InquiryBadge msg={msg} />
                          {msg.property && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{msg.property}</span>
                          )}
                        </div>

                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-1">{msg.message}</p>
                      </div>

                      <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-2">
                        <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                          {new Date(msg.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={e => setRead(msg, !msg.read, e)}
                            title={msg.read ? 'Mark as unread' : 'Mark as read'}
                            aria-label={msg.read ? 'Mark as unread' : 'Mark as read'}
                            className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-[var(--admin-accent)] hover:bg-[color-mix(in_srgb,var(--admin-accent)_10%,transparent)] rounded-lg transition"
                          >
                            {msg.read ? <Mail className="w-3.5 h-3.5" /> : <MailOpen className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={e => deleteMsg(msg.id, e)}
                            className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl w-full max-w-lg my-4 sm:my-6 shadow-2xl overflow-hidden">

            {/* Property banner (if property inquiry) */}
            {selected.propertyImg && (
              <div className="relative h-36 overflow-hidden">
                <img src={selected.propertyImg} alt={selected.property} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                  <div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-black bg-[var(--admin-accent)] px-2 py-0.5 rounded-full mb-1">
                      <Building2 className="w-2.5 h-2.5" /> Property Inquiry
                    </span>
                    <p className="text-white font-semibold text-sm truncate">{selected.property}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-gray-900 dark:text-white">Message</h2>
                {!selected.property && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-full">
                    <MessageSquare className="w-2.5 h-2.5" /> General Inquiry
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setRead(selected, false); setSelected(null); }}
                  title="Mark as unread"
                  aria-label="Mark as unread"
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-[var(--admin-accent)] hover:bg-[color-mix(in_srgb,var(--admin-accent)_10%,transparent)] rounded-lg transition"
                >
                  <Mail className="w-4 h-4" />
                </button>
                <button
                  onClick={e => deleteMsg(selected.id, e)}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => setSelected(null)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg transition">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-5">
              {/* Sender info */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-[color-mix(in_srgb,var(--admin-accent)_15%,transparent)] flex items-center justify-center font-semibold text-[var(--admin-accent)] text-sm flex-shrink-0">
                  {initials(selected)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">{displayName(selected)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selected.email}</p>
                  {selected.phone && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5" /> {selected.phone}
                    </p>
                  )}
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                  {new Date(selected.date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {selected.subject && (
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Subject</p>
                  <p className="text-gray-800 dark:text-gray-200 font-medium">{selected.subject}</p>
                </div>
              )}

              <div>
                <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Message</p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
