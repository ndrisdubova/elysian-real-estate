import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import { MessageCircle, X, Send } from 'lucide-react';
import { addMessage } from '../utils/storage';
import { properties } from '../data/properties';

const priceToNumber = (price) => parseFloat(price.replace(/[^0-9.]/g, '')) * 1_000_000;
const bedsToNumber = (beds) => parseInt(beds, 10);

const uniqueTypes = [...new Set(properties.map(p => p.type))];
const uniqueCities = [...new Set(properties.map(p => p.city))];
const uniqueCountries = [...new Set(properties.map(p => p.country))];

const featureKeywords = { pool: 'pool', garden: 'garden', gym: 'gym', terrace: 'terrace', beach: 'beach', view: 'view', parking: 'parking', cinema: 'cinema', wine: 'wine', concierge: 'concierge', security: 'security' };
const resetPattern = /\breset\b|start over|new search|clear filters/;

function parseQuery(query) {
  const q = query.toLowerCase();
  const parsed = {};

  const type = uniqueTypes.find(t => q.includes(t.toLowerCase()));
  if (type) parsed.type = type;

  const city = uniqueCities.find(c => q.includes(c.toLowerCase()));
  if (city) parsed.city = city;

  const country = uniqueCountries.find(c => q.includes(c.toLowerCase()));
  if (country) parsed.country = country;

  const underMatch = q.match(/(?:under|below|less than|max|up to)\s*\$?\s*([\d.]+)\s*m/);
  const overMatch = q.match(/(?:over|above|at least|min)\s*\$?\s*([\d.]+)\s*m/);
  const genericMatch = q.match(/\$?\s*([\d.]+)\s*m/);
  if (underMatch) parsed.maxPrice = parseFloat(underMatch[1]) * 1_000_000;
  else if (overMatch) parsed.minPrice = parseFloat(overMatch[1]) * 1_000_000;
  else if (genericMatch) parsed.maxPrice = parseFloat(genericMatch[1]) * 1_000_000;

  const bedsMatch = q.match(/(\d+)\s*\+?\s*bed/);
  if (bedsMatch) parsed.minBeds = parseInt(bedsMatch[1], 10);

  const featureKey = Object.keys(featureKeywords).find(k => q.includes(k));
  if (featureKey) parsed.feature = featureKeywords[featureKey];

  if (/cheapest|lowest price|least expensive/.test(q)) parsed.sort = 'asc';
  else if (/most expensive|highest price|priciest/.test(q)) parsed.sort = 'desc';

  return parsed;
}

function applyRelative(query, filters, lastResults) {
  const q = query.toLowerCase();
  if (!lastResults || lastResults.length === 0) return filters;
  const updated = { ...filters };

  if (/cheaper|less expensive|lower price/.test(q)) {
    const cheapest = Math.min(...lastResults.map(p => priceToNumber(p.price)));
    updated.maxPrice = cheapest - 1;
    delete updated.minPrice;
  }
  if (/more expensive|pricier|higher (price|budget)|bigger budget/.test(q)) {
    const costliest = Math.max(...lastResults.map(p => priceToNumber(p.price)));
    updated.minPrice = costliest + 1;
    delete updated.maxPrice;
  }
  if (/more bedroom|bigger place|larger home/.test(q)) {
    const maxBedsShown = Math.max(...lastResults.map(p => bedsToNumber(p.beds)));
    updated.minBeds = maxBedsShown + 1;
  }
  if (/fewer bedroom|smaller place/.test(q)) {
    updated.minBeds = Math.max(0, (updated.minBeds || 0) - 1);
  }
  return updated;
}

function matchProperties(filters) {
  let list = properties.filter(p => {
    if (filters.type && p.type !== filters.type) return false;
    if (filters.city && p.city !== filters.city) return false;
    if (filters.country && p.country !== filters.country) return false;
    if (filters.maxPrice != null && priceToNumber(p.price) > filters.maxPrice) return false;
    if (filters.minPrice != null && priceToNumber(p.price) < filters.minPrice) return false;
    if (filters.minBeds != null && bedsToNumber(p.beds) < filters.minBeds) return false;
    if (filters.feature && !p.features.some(f => f.toLowerCase().includes(filters.feature))) return false;
    return true;
  });

  if (filters.sort === 'asc') list = [...list].sort((a, b) => priceToNumber(a.price) - priceToNumber(b.price));
  else if (filters.sort === 'desc') list = [...list].sort((a, b) => priceToNumber(b.price) - priceToNumber(a.price));

  return list.slice(0, 4);
}

export default function Chatbot() {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([{ type: 'bot', text: null, isWelcome: true }]);
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [subject, setSubject] = useState('Chatbot Inquiry');
  const [searchMode, setSearchMode] = useState(false);
  const [searching, setSearching] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [lastFilters, setLastFilters] = useState({});
  const [lastResults, setLastResults] = useState([]);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (chatOpen && messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [chatMessages, chatOpen]);

  const goToProperty = (id) => {
    setChatOpen(false);
    navigate(`/properties/${id}`);
  };

  const goToContact = () => {
    setChatOpen(false);
    navigate('/contact');
  };

  const handleQuickAction = (action) => {
    setActiveAction(action);
    if (action === 'properties') {
      setSearchMode(true);
      setLastFilters({});
      setLastResults([]);
      return;
    }
    setSearchMode(false);
    const label = action === 'contact' ? 'Contact Request' : 'Property Inquiry';
    setSubject(label);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text || chatSending || searching) return;
    setChatMessages(m => [...m, { type: 'user', text }]);
    setChatInput('');

    if (searchMode) {
      setSearching(true);
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 500));

      const isReset = resetPattern.test(text.toLowerCase());
      const parsed = parseQuery(text);
      const baseFilters = isReset ? {} : lastFilters;
      const baseResults = isReset ? [] : lastResults;
      const relativeAdjusted = applyRelative(text, baseFilters, baseResults);
      const filters = { ...relativeAdjusted, ...parsed };

      if (Object.keys(filters).length === 0) {
        if (isReset) { setLastFilters({}); setLastResults([]); }
        setChatMessages(m => [...m, { type: 'bot', text: `Tell me a city (${uniqueCities.join(', ')}), a type (${uniqueTypes.join(', ')}), a budget like "under $5M", a bedroom count, or say "cheapest" / "most expensive".` }]);
      } else {
        const matches = matchProperties(filters);
        if (matches.length > 0) {
          setLastFilters(filters);
          setLastResults(matches);
          const label = filters.sort === 'asc' ? 'The most affordable option' : filters.sort === 'desc' ? 'The most expensive option' : `Found ${matches.length} match${matches.length > 1 ? 'es' : ''} for you`;
          setChatMessages(m => [...m, { type: 'bot', text: `${label}:`, properties: matches }]);
        } else {
          setChatMessages(m => [...m, { type: 'bot', text: `No matches for that. Try loosening a filter, or say "reset" to start over.` }]);
        }
      }
      setSearching(false);
      return;
    }

    setChatSending(true);
    await addMessage({ firstName: 'Chat', lastName: 'Visitor', email: 'chatbot@terra.com', subject, message: text });
    try {
      await emailjs.send(
        'service_gkwnn4k',
        'template_j7abcbp',
        { first_name: 'Chat', last_name: 'Visitor', email: 'chatbot@terra.com', subject, message: text },
        'yXRguh-oDkNVwjAWI'
      );
      setChatMessages(m => [...m, { type: 'bot', text: "Thanks for reaching out! We've received your message and will get back to you shortly. You can also call us at +383 48 77 33 88 or through email info.terra@gmail.com." }]);
    } catch {
      setChatMessages(m => [...m, { type: 'bot', text: "Sorry, we couldn't send your message. Please try emailing us directly at contact@terra.com." }]);
    } finally {
      setChatSending(false);
    }
  };

  return (
    <>
      <button id="chat-toggle-btn" onClick={() => setChatOpen(o => !o)} aria-label="Open chat">
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
                  Welcome to Terra Estates. Ask me about properties, our services, or for buying advice.
                  <div className="text-xs text-charcoal/60 mt-3 pt-3 border-t border-charcoal/10">
                    Need to speak to a person?{' '}
                    <button type="button" onClick={goToContact} className="font-semibold text-soft-gold hover:text-dark-gold bg-transparent border-none p-0 cursor-pointer underline">Call Us</button> or{' '}
                    <button type="button" onClick={goToContact} className="font-semibold text-soft-gold hover:text-dark-gold bg-transparent border-none p-0 cursor-pointer underline">Email Us</button>.
                  </div>
                </>
              ) : msg.text}
              {msg.properties && (
                <div className="chat-property-results">
                  {msg.properties.map(p => (
                    <button key={p.id} type="button" className="chat-property-card" onClick={() => goToProperty(p.id)}>
                      <img src={p.img} alt={p.title} />
                      <div className="chat-property-card-info">
                        <strong>{p.title}</strong>
                        <span>{p.city}, {p.country} · {p.price}</span>
                        <span>{p.beds} · {p.baths}</span>
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
          {searching && (
            <div className="chat-message bot" style={{ opacity: 0.6, fontStyle: 'italic' }}>
              Searching listings...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="chatbot-quick-actions">
          <button type="button" className={activeAction === 'contact' ? 'active' : ''} onClick={() => handleQuickAction('contact')}>Contact</button>
          <button type="button" className={activeAction === 'inquiries' ? 'active' : ''} onClick={() => handleQuickAction('inquiries')}>Inquiries</button>
          <button type="button" className={activeAction === 'properties' ? 'active' : ''} onClick={() => handleQuickAction('properties')}>Find Properties</button>
          <p><small>Chatbot can make mistakes. Check important <Link to="/chatbot-info" onClick={() => setChatOpen(false)}>info</Link>.</small></p>
        </div>
        <div className="chatbot-input">
          <form onSubmit={sendMessage}>
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder={searchMode ? 'e.g. villa in Paris under $6M' : 'Type your message...'}
              autoComplete="off"
              disabled={chatSending || searching}
            />
            <button type="submit" aria-label="Send message" disabled={chatSending || searching}>
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
