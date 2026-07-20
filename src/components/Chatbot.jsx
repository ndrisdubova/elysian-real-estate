import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import { MessageCircle, X, Send } from 'lucide-react';
import { addMessage, getProperties, getAgents } from '../utils/storage';
import { createConcierge } from '../utils/concierge';

export default function Chatbot() {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([{ type: 'bot', text: null, isWelcome: true }]);
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [subject, setSubject] = useState('Chatbot Inquiry');
  // mode: 'ask' (concierge) | 'contact' | 'inquiries'
  const [mode, setMode] = useState('ask');
  const [thinking, setThinking] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [booking, setBooking] = useState(null); // { step: 'name'|'contact'|'time', data }
  const [properties, setProperties] = useState([]);
  const [agents, setAgents] = useState([]);
  const conciergeCtx = useRef({});
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Load the catalogue (which pulls in the Supabase client) only once the user
  // first opens the chat — not on every page load — so it doesn't compete with
  // the hero/fonts on first paint, especially on mobile.
  const dataLoaded = useRef(false);
  useEffect(() => {
    if (!chatOpen || dataLoaded.current) return;
    dataLoaded.current = true;
    getProperties().then(setProperties);
    getAgents().then(setAgents);
  }, [chatOpen]);

  // The "brain" — rebuilt whenever the catalogue changes. Runs 100% in-browser.
  const concierge = useMemo(
    () => createConcierge({ properties, agents }),
    [properties, agents],
  );

  useEffect(() => {
    if (chatOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [chatMessages, chatOpen, suggestions]);

  const goToProperty = (id) => {
    setChatOpen(false);
    navigate(`/properties/${id}`);
  };

  const goToContact = () => {
    setChatOpen(false);
    navigate('/contact');
  };

  const handleQuickAction = (action) => {
    setMode(action);
    setBooking(null);
    if (action === 'ask') {
      setSubject('Chatbot Inquiry');
      return;
    }
    setSuggestions([]);
    setSubject(action === 'contact' ? 'Contact Request' : 'Property Inquiry');
  };

  const pushBot = (text, extra = {}) =>
    setChatMessages((m) => [...m, { type: 'bot', text, ...extra }]);

  // Ask the in-browser concierge and render its reply + any property cards.
  const askConcierge = async (text) => {
    setThinking(true);
    // small, human-feeling delay so replies don't appear instantaneously
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 500));
    const res = concierge.respond(text, conciergeCtx.current);
    conciergeCtx.current = res.context || {};
    setThinking(false);

    if (res.action === 'book_viewing') {
      startBooking(res.property);
      return;
    }
    pushBot(res.text, { properties: res.properties });
    setSuggestions(res.suggestions || []);
  };

  // Begin the guided booking flow (name → contact → time → submit).
  const startBooking = (property) => {
    setSuggestions([]);
    setBooking({ step: 'name', data: { property } });
    pushBot(`Wonderful — let's arrange a viewing${property ? ` for the ${property.title}` : ''}. First, what name should I book it under?`);
  };

  // Advance one step of the booking flow with the visitor's latest answer.
  const handleBookingStep = async (text) => {
    const b = booking;
    if (/^(cancel|nevermind|never mind|stop|no thanks|forget it)$/i.test(text.trim())) {
      setBooking(null);
      pushBot('No problem — I’ve cancelled that. Is there anything else I can help you with?');
      setSuggestions(['Show me listings', 'Talk to an agent']);
      return;
    }
    if (b.step === 'name') {
      setBooking({ step: 'contact', data: { ...b.data, name: text.trim() } });
      pushBot(`Thanks, ${text.trim()}! What’s the best phone number or email to reach you on?`);
      return;
    }
    if (b.step === 'contact') {
      setBooking({ step: 'time', data: { ...b.data, contact: text.trim() } });
      pushBot('Great. What day and time works best for the viewing?');
      return;
    }
    if (b.step === 'time') {
      const data = { ...b.data, time: text.trim() };
      setBooking(null);
      await submitBooking(data);
    }
  };

  // Submit the completed booking to the team (same pipeline as Contact/Inquiries).
  const submitBooking = async (data) => {
    setChatSending(true);
    const isEmail = /@/.test(data.contact);
    const summary = `Viewing request via chatbot.\nName: ${data.name}\nContact: ${data.contact}\nPreferred time: ${data.time}\nProperty: ${data.property?.title || 'General enquiry'}`;
    try {
      await addMessage({
        firstName: data.name || 'Chat',
        lastName: 'Viewing',
        email: isEmail ? data.contact : 'chatbot@terra.com',
        phone: isEmail ? '' : data.contact,
        subject: 'Viewing Request',
        message: summary,
        property: data.property?.title || '',
        propertyImg: data.property?.img || '',
      });
      await emailjs.send(
        'service_gkwnn4k',
        'template_j7abcbp',
        { first_name: data.name || 'Chat', last_name: 'Viewing', email: isEmail ? data.contact : 'chatbot@terra.com', subject: 'Viewing Request', message: summary },
        'yXRguh-oDkNVwjAWI',
      );
      pushBot(`You're all set${data.name ? `, ${data.name}` : ''}! I've sent your viewing request${data.property ? ` for the ${data.property.title}` : ''} to our team — we'll confirm ${data.time} shortly via ${data.contact}. You can also reach us on +383 48 77 33 88.`);
    } catch {
      pushBot(`I couldn't submit that automatically, but please call +383 48 77 33 88 or email info.terra@gmail.com and we'll lock in your viewing${data.property ? ` for the ${data.property.title}` : ''} right away.`);
    } finally {
      setChatSending(false);
      setSuggestions(['Show me more listings', 'Talk to an agent']);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text || chatSending || thinking) return;
    setChatMessages((m) => [...m, { type: 'user', text }]);
    setChatInput('');

    // A booking in progress takes priority over everything else.
    if (booking) {
      await handleBookingStep(text);
      return;
    }

    if (mode === 'ask') {
      await askConcierge(text);
      return;
    }

    // Contact / Inquiries → save + email the team (unchanged flow)
    setChatSending(true);
    await addMessage({ firstName: 'Chat', lastName: 'Visitor', email: 'chatbot@terra.com', subject, message: text });
    try {
      await emailjs.send(
        'service_gkwnn4k',
        'template_j7abcbp',
        { first_name: 'Chat', last_name: 'Visitor', email: 'chatbot@terra.com', subject, message: text },
        'yXRguh-oDkNVwjAWI',
      );
      setChatMessages((m) => [...m, { type: 'bot', text: "Thanks for reaching out! We've received your message and will get back to you shortly. You can also call us at +383 48 77 33 88 or through email info.terra@gmail.com." }]);
    } catch {
      setChatMessages((m) => [...m, { type: 'bot', text: "Sorry, we couldn't send your message. Please try emailing us directly at contact@terra.com." }]);
    } finally {
      setChatSending(false);
    }
  };

  // Clicking a suggestion chip sends it as if typed.
  const sendSuggestion = async (text) => {
    if (chatSending || thinking) return;
    setChatMessages((m) => [...m, { type: 'user', text }]);
    setSuggestions([]);
    await askConcierge(text);
  };

  return (
    <>
      <button id="chat-toggle-btn" onClick={() => setChatOpen((o) => !o)} aria-label="Open chat">
        <MessageCircle className="w-8 h-8" />
      </button>
      <div id="chatbot-window" className={chatOpen ? 'is-visible' : ''}>
        <div className="chatbot-header">
          <div>
            <h3 className="font-display text-xl font-bold">Terra Concierge</h3>
            <p className="text-xs text-ivory/70">How can we help you today?</p>
          </div>
          <button onClick={() => setChatOpen(false)} aria-label="Close chat" className="bg-transparent border-none cursor-pointer">
            <X className="w-6 h-6 text-ivory/70 hover:text-ivory" />
          </button>
        </div>
        <div className="chatbot-messages">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.type}`}>
              {msg.isWelcome ? (
                <>
                  Welcome to Terra Estates. I'm your virtual concierge — ask me about properties, prices, locations, financing, or booking a viewing.
                  <div className="text-xs text-charcoal/60 mt-3 pt-3 border-t border-charcoal/10">
                    Need to speak to a person?{' '}
                    <button type="button" onClick={goToContact} className="font-semibold text-soft-gold hover:text-dark-gold bg-transparent border-none p-0 cursor-pointer underline">Call Us</button> or{' '}
                    <button type="button" onClick={goToContact} className="font-semibold text-soft-gold hover:text-dark-gold bg-transparent border-none p-0 cursor-pointer underline">Email Us</button>.
                  </div>
                </>
              ) : (
                <span style={{ whiteSpace: 'pre-line' }}>{msg.text}</span>
              )}
              {msg.properties && msg.properties.length > 0 && (
                <div className="chat-property-results">
                  {msg.properties.map((p) => (
                    <button key={p.id} type="button" className="chat-property-card" onClick={() => goToProperty(p.id)}>
                      <img src={p.img} alt={p.title} loading="lazy" decoding="async" />
                      <div className="chat-property-card-info">
                        <strong>{p.title}</strong>
                        <span>{p.type} · {p.city}, {p.country} · {p.price}</span>
                        <span>{p.beds} · {p.baths} · {p.size}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {chatSending && (
            <div className="chat-message bot" style={{ opacity: 0.6, fontStyle: 'italic' }}>
              Sending your message...
            </div>
          )}
          {thinking && (
            <div className="chat-message bot" style={{ opacity: 0.6, fontStyle: 'italic' }}>
              Typing...
            </div>
          )}
          {mode === 'ask' && !thinking && suggestions.length > 0 && (
            <div className="chat-suggestions" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => sendSuggestion(s)}
                  className="text-xs px-3 py-1.5 rounded-full border border-soft-gold/50 text-charcoal hover:bg-soft-gold hover:text-charcoal transition-colors bg-transparent cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="chatbot-quick-actions">
          <button type="button" className={mode === 'ask' ? 'active' : ''} onClick={() => handleQuickAction('ask')}>Ask Terra</button>
          <button type="button" className={mode === 'contact' ? 'active' : ''} onClick={() => handleQuickAction('contact')}>Contact</button>
          <button type="button" className={mode === 'inquiries' ? 'active' : ''} onClick={() => handleQuickAction('inquiries')}>Inquiries</button>
          <p><small>Concierge can make mistakes. Check important <Link to="/chatbot-info" onClick={() => setChatOpen(false)}>info</Link>.</small></p>
        </div>
        <div className="chatbot-input">
          <form onSubmit={sendMessage}>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={booking ? 'Type your answer…' : mode === 'ask' ? 'Ask anything — e.g. villa in Paris under $6M' : 'Type your message...'}
              autoComplete="off"
              disabled={chatSending || thinking}
            />
            <button type="submit" aria-label="Send message" disabled={chatSending || thinking}>
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
