// concierge.js
// ---------------------------------------------------------------------------
// Terra Estates "concierge" — a fully client-side conversational engine.
//
// This is NOT a neural LLM. It's a domain-trained assistant that runs entirely
// in the browser (no server, no API key, no cost). It understands natural
// language, synonyms, typos, and follow-up questions, and answers from Terra's
// own data: live listings, agents, and a built-in knowledge base covering
// buying, selling, financing, viewings, fees, locations and more.
//
// Public API:
//   const bot = createConcierge({ properties, agents, settings });
//   bot.greeting();                       -> string (opening line)
//   bot.respond(text, context) -> { text, properties, context, suggestions }
//
// `context` is an opaque object you pass back on every turn so the bot can
// remember what it just showed (for follow-ups like "cheaper" or "the 2nd one").
// ---------------------------------------------------------------------------

const CONTACT = {
  phone: '+383 48 77 33 88',
  email: 'info.terra@gmail.com',
  address: '123 Luxury Ave, Beverly Hills, CA 90210',
};

// --- text utilities --------------------------------------------------------

const STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'to', 'of', 'in',
  'on', 'at', 'for', 'and', 'or', 'but', 'with', 'about', 'as', 'by', 'i', 'me',
  'my', 'we', 'our', 'you', 'your', 'it', 'this', 'that', 'these', 'those',
  'do', 'does', 'did', 'have', 'has', 'had', 'can', 'could', 'would', 'should',
  'will', 'want', 'need', 'looking', 'look', 'like', 'please', 'show', 'find',
  'get', 'give', 'tell', 'any', 'some', 'there', 'here', 'im', "i'm", 'us',
]);

// Synonym groups. Every word in a group is treated as interchangeable, so a
// query using any variant matches knowledge/keywords that use another variant.
const SYNONYM_GROUPS = [
  ['hi', 'hello', 'hey', 'yo', 'hiya', 'heya', 'greetings', 'howdy'],
  ['bye', 'goodbye', 'cya', 'later', 'farewell'],
  ['thanks', 'thank', 'thankyou', 'thx', 'ty', 'appreciate', 'cheers', 'grateful'],
  ['buy', 'buying', 'purchase', 'purchasing', 'acquire', 'own', 'ownership'],
  ['sell', 'selling', 'sale', 'listing', 'list'],
  ['rent', 'rental', 'lease', 'renting', 'leasing'],
  ['price', 'prices', 'cost', 'costs', 'pricing', 'budget', 'afford', 'affordable'],
  ['cheap', 'cheapest', 'lowest', 'affordable', 'inexpensive', 'least'],
  ['expensive', 'priciest', 'pricey', 'luxurious', 'highest', 'costliest', 'dearest'],
  ['mortgage', 'loan', 'finance', 'financing', 'financed', 'installment', 'bank', 'lending', 'credit'],
  ['view', 'viewing', 'visit', 'tour', 'see', 'showing', 'appointment', 'book', 'booking', 'schedule', 'inspect'],
  ['fee', 'fees', 'commission', 'commissions', 'charge', 'charges', 'percentage'],
  ['agent', 'agents', 'realtor', 'realtors', 'broker', 'brokers', 'staff', 'team', 'advisor', 'advisors', 'consultant'],
  ['contact', 'call', 'phone', 'email', 'reach', 'number', 'telephone', 'mail', 'message'],
  ['location', 'locations', 'where', 'area', 'areas', 'region', 'place', 'places', 'destination', 'destinations'],
  ['invest', 'investment', 'investing', 'roi', 'return', 'returns', 'yield', 'income', 'profit'],
  ['help', 'assist', 'assistance', 'support', 'guide'],
  ['about', 'who', 'company', 'firm', 'agency', 'terra', 'business'],
  ['service', 'services', 'offer', 'offering', 'provide', 'do'],
  ['hours', 'open', 'opening', 'time', 'times', 'available', 'availability', 'when'],
  ['legal', 'law', 'lawyer', 'paperwork', 'documents', 'contract', 'notary', 'title', 'deed'],
  ['negotiate', 'negotiation', 'offer', 'bid', 'bidding', 'haggle', 'discount'],
  ['family', 'families', 'kids', 'children', 'child', 'school', 'schools'],
  ['pet', 'pets', 'dog', 'cat', 'animal', 'animals'],
  ['new', 'newest', 'latest', 'recent', 'fresh'],
  ['apartment', 'apartments', 'flat', 'flats', 'condo', 'condos'],
  ['villa', 'villas', 'house', 'houses', 'mansion', 'home', 'homes'],
  ['penthouse', 'penthouses'],
  ['pool', 'pools', 'swimming'],
  ['gym', 'fitness', 'workout'],
  ['garden', 'gardens', 'yard', 'lawn', 'outdoor'],
  ['beach', 'beachfront', 'seaside', 'waterfront', 'sea', 'ocean'],
  ['parking', 'garage', 'car'],
  ['security', 'secure', 'safe', 'safety', 'guarded', 'gated'],
];

// Build a lookup: word -> canonical group id (index).
const SYN_LOOKUP = new Map();
SYNONYM_GROUPS.forEach((group, i) => {
  group.forEach((w) => SYN_LOOKUP.set(w, i));
});

function normalize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9€$%²\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Very light stemmer — strips common English suffixes so "viewings"/"viewing"
// collapse to the same stem before synonym lookup.
function stem(word) {
  if (word.length <= 3) return word;
  return word
    .replace(/(ing|ed|ly|es|s)$/i, '')
    .replace(/i$/i, 'y');
}

function tokenize(text, { keepStop = false } = {}) {
  return normalize(text)
    .split(' ')
    .filter((w) => w && (keepStop || !STOPWORDS.has(w)));
}

// Expand a token to its full synonym group (as canonical group ids + the token).
function expand(token) {
  const forms = new Set([token, stem(token)]);
  const out = new Set();
  forms.forEach((f) => {
    if (SYN_LOOKUP.has(f)) out.add(`g${SYN_LOOKUP.get(f)}`);
    out.add(f);
  });
  return [...out];
}

// Turn a whole query into a "concept set": every synonym group + raw token it
// touches. Used for scoring against knowledge entries.
function concepts(text) {
  const set = new Set();
  tokenize(text).forEach((tok) => expand(tok).forEach((c) => set.add(c)));
  return set;
}

// Levenshtein distance for fuzzy city/type matching (handles small typos).
function levenshtein(a, b) {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  const row = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = row[j];
      row[j] = Math.min(
        row[j] + 1,
        row[j - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      prev = tmp;
    }
  }
  return row[n];
}

// Does any token in the query fuzzily match `target` (a city/type name)?
function fuzzyHas(tokens, target) {
  const t = normalize(target);
  if (!t) return false;
  const compact = t.replace(/\s/g, '');
  return tokens.some((tok) => {
    if (tok === t || tok === compact) return true;
    if (t.includes(tok) && tok.length >= 4) return true;
    const tol = tok.length >= 6 ? 2 : 1;
    return levenshtein(tok, compact) <= tol;
  });
}

// --- property helpers ------------------------------------------------------

const priceToNumber = (price) => {
  if (typeof price === 'number') return price;
  const n = parseFloat(String(price).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n * 1_000_000 : 0;
};
const bedsToNumber = (beds) => parseInt(String(beds), 10) || 0;

const FEATURE_WORDS = ['pool', 'garden', 'gym', 'terrace', 'beach', 'view', 'parking', 'cinema', 'wine', 'concierge', 'security', 'lift', 'rooftop'];

function propertyHaystack(p) {
  return [p.title, p.type, p.city, p.country, p.price, p.beds, p.baths, p.size, p.description, ...(p.features || [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

// Extract structured filters (type / city / country / price / beds / feature /
// sort) from free text, using the actual values present in the catalogue.
function parseFilters(text, { types, cities, countries }) {
  const tokens = tokenize(text, { keepStop: true });
  const filters = {};

  const type = types.find((t) => fuzzyHas(tokens, t));
  if (type) filters.type = type;

  const city = cities.find((c) => fuzzyHas(tokens, c));
  if (city) filters.city = city;

  const country = countries.find((c) => fuzzyHas(tokens, c));
  if (country) filters.country = country;

  const q = normalize(text);
  const under = q.match(/(?:under|below|less than|max|up to|cheaper than|within)\s*\$?\s*([\d.]+)\s*(m|million|k)?/);
  const over = q.match(/(?:over|above|at least|min|more than|from)\s*\$?\s*([\d.]+)\s*(m|million|k)?/);
  const generic = q.match(/\$\s*([\d.]+)\s*(m|million|k)?/);
  const scale = (unit) => (unit === 'k' ? 1_000 : 1_000_000);
  if (under) filters.maxPrice = parseFloat(under[1]) * scale(under[2]);
  else if (over) filters.minPrice = parseFloat(over[1]) * scale(over[2]);
  else if (generic) filters.maxPrice = parseFloat(generic[1]) * scale(generic[2]);

  const beds = q.match(/(\d+)\s*\+?\s*(?:bed|bedroom|br)/);
  if (beds) filters.minBeds = parseInt(beds[1], 10);

  const feature = FEATURE_WORDS.find((f) => tokens.some((tok) => stem(tok) === stem(f) || expand(tok).includes(f)));
  if (feature) filters.feature = feature;

  if (/cheap|lowest|least expensive|affordable|budget/.test(q)) filters.sort = 'asc';
  else if (/expensive|priciest|highest|most luxur|dearest/.test(q)) filters.sort = 'desc';

  return filters;
}

function matchProperties(filters, properties) {
  let list = properties.filter((p) => {
    if (filters.type && p.type.toLowerCase() !== filters.type.toLowerCase()) return false;
    if (filters.city && p.city.toLowerCase() !== filters.city.toLowerCase()) return false;
    if (filters.country && p.country.toLowerCase() !== filters.country.toLowerCase()) return false;
    if (filters.maxPrice != null && priceToNumber(p.price) > filters.maxPrice) return false;
    if (filters.minPrice != null && priceToNumber(p.price) < filters.minPrice) return false;
    if (filters.minBeds != null && bedsToNumber(p.beds) < filters.minBeds) return false;
    if (filters.feature && !(p.features || []).some((f) => f.toLowerCase().includes(filters.feature))) return false;
    if (filters.keywords && !filters.keywords.every((k) => propertyHaystack(p).includes(k))) return false;
    return true;
  });
  if (filters.sort === 'asc') list = [...list].sort((a, b) => priceToNumber(a.price) - priceToNumber(b.price));
  else if (filters.sort === 'desc') list = [...list].sort((a, b) => priceToNumber(b.price) - priceToNumber(a.price));
  return list;
}

const hasFilterSignal = (f) =>
  ['type', 'city', 'country', 'maxPrice', 'minPrice', 'minBeds', 'feature', 'sort'].some((k) => f[k] != null);

// pick a random element (for response variety)
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// human-friendly list join: "A, B and C"
function humanList(items) {
  const a = items.filter(Boolean);
  if (a.length <= 1) return a.join('');
  return `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`;
}

// Describe a single property in a warm sentence.
function describe(p) {
  const feats = (p.features || []).slice(0, 3);
  const featText = feats.length ? ` Highlights include ${humanList(feats)}.` : '';
  const desc = p.description ? ` ${p.description.split('. ')[0]}.` : '';
  return `${p.title} — a ${p.type.toLowerCase()} in ${p.city}, ${p.country}, priced at ${p.price}. ${p.beds} · ${p.baths} · ${p.size}.${desc}${featText}`;
}

// --- knowledge base --------------------------------------------------------
// Each entry: keywords (weighted concept matches) + an answer() built from
// live data. Scoring counts how many of the query's concepts hit the entry's
// keywords; the best-scoring entry above threshold wins.

function buildKnowledge(data) {
  const { properties, agents, cities, countries } = data;
  const cheapest = [...properties].sort((a, b) => priceToNumber(a.price) - priceToNumber(b.price))[0];
  const priciest = [...properties].sort((a, b) => priceToNumber(b.price) - priceToNumber(a.price))[0];
  const founders = agents.filter((a) => a.type === 'founder');

  return [
    {
      id: 'greeting',
      keywords: ['g0', 'hi', 'hello', 'hey', 'morning', 'evening', 'afternoon'],
      answer: () => pick([
        "Hello! I'm the Terra Estates concierge. I can help you explore listings, answer questions about buying or selling, or connect you with an agent. What are you looking for?",
        'Hi there! Welcome to Terra Estates. Ask me about properties, prices, locations, financing, or booking a viewing.',
        'Hey! Great to have you. Tell me what you need — a home in a certain city, a budget, or advice on buying — and I’ll take it from there.',
      ]),
    },
    {
      id: 'thanks',
      keywords: ['g2', 'thanks', 'thank', 'appreciate', 'cheers', 'helpful'],
      answer: () => pick([
        "You're very welcome! Anything else I can help you find?",
        'My pleasure. Let me know if you’d like to see more listings or speak with an agent.',
        'Happy to help! I’m here whenever you need me.',
      ]),
    },
    {
      id: 'bye',
      keywords: ['g1', 'bye', 'goodbye', 'later', 'done'],
      answer: () => pick([
        `Take care! When you’re ready, reach us any time at ${CONTACT.phone} or ${CONTACT.email}.`,
        'Goodbye for now — come back whenever you’d like to explore more of our portfolio.',
      ]),
    },
    {
      id: 'agents',
      keywords: ['g12', 'agent', 'realtor', 'broker', 'team', 'staff', 'advisor', 'consultant', 'expert'],
      answer: () => {
        if (!agents.length) return `Our team of specialist agents is ready to help — reach them at ${CONTACT.phone} or ${CONTACT.email}.`;
        const lead = founders[0] || agents[0];
        const others = agents.filter((a) => a !== lead).slice(0, 3).map((a) => `${a.name} (${a.role})`);
        return `Our team is led by ${lead.name}, ${lead.role}. You’d also be in great hands with ${humanList(others)}. Want me to connect you with one of them?`;
      },
    },
    {
      id: 'about',
      keywords: ['g17', 'about', 'who', 'company', 'terra', 'agency', 'firm', 'story', 'mission'],
      answer: () => pick([
        `Terra Estates is a luxury real-estate agency curating some of the finest properties across ${humanList(countries)}. We don’t just sell homes — we craft a full concierge experience, from private viewings to expert negotiation.`,
        `We’re Terra Estates, specialists in prestige property. Our team handles everything end-to-end: exclusive off-market access, bespoke marketing, and white-glove guidance through every step.`,
      ]),
    },
    {
      id: 'services',
      keywords: ['g18', 'service', 'services', 'offer', 'provide', 'help', 'do'],
      answer: () => 'We offer a full-service experience: exclusive access to off-market and private listings, a global network of elite buyers and agents, bespoke marketing for sellers, expert negotiation, and concierge support through viewings, financing and closing. What would you like help with?',
    },
    {
      id: 'contact',
      keywords: ['g13', 'contact', 'call', 'phone', 'email', 'reach', 'number', 'human', 'person', 'talk', 'speak'],
      answer: () => `You can reach our team directly:\n📞 ${CONTACT.phone}\n✉️ ${CONTACT.email}\n📍 ${CONTACT.address}\nOr I can pass your details along — just switch to the “Contact” option below and send a message.`,
    },
    {
      id: 'hours',
      keywords: ['g20', 'hours', 'open', 'time', 'when', 'available'],
      answer: () => 'Our team is available Monday to Saturday, 9:00–19:00, and viewings can be arranged outside those hours by appointment. I’m here 24/7 to answer questions and help you shortlist properties.',
    },
    {
      id: 'financing',
      keywords: ['g9', 'mortgage', 'loan', 'finance', 'financing', 'bank', 'payment', 'installment', 'deposit', 'downpayment'],
      answer: () => 'Absolutely — we work with trusted private banks and mortgage advisors who specialise in high-value property. Typically you’ll want a deposit of 20–30%, and we can connect you with a lender to arrange pre-approval before you make an offer. Would you like an agent to walk you through financing options?',
    },
    {
      id: 'buying',
      keywords: ['g3', 'buy', 'buying', 'purchase', 'process', 'steps', 'how'],
      answer: () => 'Buying with Terra is simple: 1) Tell me your budget, location and must-haves and I’ll shortlist matches. 2) We arrange private viewings. 3) When you find the one, our agents handle the offer and negotiation. 4) We guide you through financing, legal checks and closing. Want me to shortlist some properties now? Just tell me a city and budget.',
    },
    {
      id: 'selling',
      keywords: ['g4', 'sell', 'selling', 'sale', 'list', 'listing', 'valuation', 'value'],
      answer: () => `Thinking of selling? We’d love to help. We start with a free valuation, then create a bespoke marketing plan — professional photography, exposure to our global buyer network, and expert negotiation to secure the best price. Reach our team at ${CONTACT.phone} or ${CONTACT.email} to book a valuation.`,
    },
    {
      id: 'renting',
      keywords: ['g5', 'rent', 'rental', 'lease', 'renting'],
      answer: () => 'Our portfolio focuses on sales of luxury properties, but our team can advise on premium rentals and short-term stays in select locations. Let me know the city and dates you have in mind and I’ll flag it for an agent.',
    },
    {
      id: 'viewing',
      keywords: ['g10', 'view', 'viewing', 'visit', 'tour', 'see', 'book', 'appointment', 'schedule'],
      answer: () => `I’d be glad to arrange a viewing. Tell me which property caught your eye — or a city and budget and I’ll shortlist a few — then our team will confirm a time. You can also book directly on ${CONTACT.phone} or ${CONTACT.email}.`,
    },
    {
      id: 'fees',
      keywords: ['g11', 'fee', 'fees', 'commission', 'charge', 'percentage', 'cost'],
      answer: () => 'For buyers, our concierge guidance is complimentary — you pay no fee to search, view, or get advice. For sellers, our commission is agreed upfront and reflects the full-service marketing and negotiation we provide. An agent can share exact figures for your situation.',
    },
    {
      id: 'locations',
      keywords: ['g14', 'location', 'where', 'area', 'city', 'cities', 'country', 'countries', 'destination'],
      answer: () => `We currently have listings in ${humanList(cities)} across ${humanList(countries)}. Tell me which city interests you and I’ll show you what’s available.`,
    },
    {
      id: 'investment',
      keywords: ['g15', 'invest', 'investment', 'roi', 'return', 'yield', 'income', 'profit', 'appreciation'],
      answer: () => 'Great question. Prime real estate in our markets tends to hold value well and can generate strong rental yields — especially waterfront and city-centre properties. Our advisors can put together a tailored investment view (expected yield, appreciation, demand) for any listing you like. Want me to show the properties best suited to investment?',
    },
    {
      id: 'legal',
      keywords: ['g21', 'legal', 'law', 'lawyer', 'paperwork', 'documents', 'contract', 'notary', 'title', 'deed', 'tax'],
      answer: () => 'We handle the legal side end-to-end. Our in-house advisors and partner notaries manage contracts, title checks, tax guidance and cross-border paperwork so the process is smooth wherever you buy. Nothing for you to worry about — we’ll guide each step.',
    },
    {
      id: 'negotiate',
      keywords: ['g22', 'negotiate', 'negotiation', 'offer', 'bid', 'discount', 'haggle', 'lower'],
      answer: () => 'Negotiation is where our agents shine. We advise on a smart offer based on market data, then negotiate firmly on your behalf to get you the best possible terms. Find a property you love and we’ll take it from there.',
    },
    {
      id: 'family',
      keywords: ['g23', 'family', 'kids', 'children', 'school', 'schools', 'safe', 'neighbourhood'],
      answer: () => 'For families we’d point you toward spacious villas and estates with gardens, security and proximity to top schools. Tell me the city and how many bedrooms you need, and I’ll shortlist family-friendly homes.',
    },
    {
      id: 'pets',
      keywords: ['g24', 'pet', 'dog', 'cat', 'animal'],
      answer: () => 'Most of our villas and estates — especially those with private gardens — are perfect for pets. Let me know your city and I’ll show you homes with outdoor space.',
    },
    {
      id: 'cheapest',
      keywords: ['g7', 'cheap', 'cheapest', 'affordable', 'lowest', 'budget', 'least'],
      strong: true,
      answer: (ctx) => {
        if (!cheapest) return 'We don’t have any listings loaded right now — please check back shortly.';
        ctx.lastResults = [cheapest];
        return { text: `Our most affordable listing right now is the ${cheapest.title} in ${cheapest.city} at ${cheapest.price}.`, properties: [cheapest] };
      },
    },
    {
      id: 'priciest',
      keywords: ['g8', 'expensive', 'priciest', 'luxurious', 'highest', 'most', 'best'],
      strong: true,
      answer: (ctx) => {
        if (!priciest) return 'We don’t have any listings loaded right now — please check back shortly.';
        ctx.lastResults = [priciest];
        return { text: `Our most prestigious listing is the ${priciest.title} in ${priciest.city}, priced at ${priciest.price}.`, properties: [priciest] };
      },
    },
    {
      id: 'count',
      keywords: ['g16', 'many', 'much', 'count', 'total', 'number', 'available', 'inventory', 'portfolio'],
      answer: () => `We currently have ${properties.length} handpicked ${properties.length === 1 ? 'property' : 'properties'} available across ${humanList(cities)}. Want to browse them by city, type or budget?`,
    },
    {
      id: 'capabilities',
      keywords: ['g16', 'help', 'assist', 'do', 'can', 'able', 'what'],
      answer: () => 'I can help you with lots of things! For example:\n• Search listings — “villa in Paris under €6M”, “apartments with a pool”\n• Compare — “cheapest one”, “something more expensive”\n• Answer questions — buying process, financing, fees, viewings, locations\n• Connect you with an agent\nWhat would you like to do?',
    },
  ];
}

// Score a knowledge entry against the query's concept set.
function scoreEntry(entry, conceptSet) {
  let score = 0;
  for (const kw of entry.keywords) {
    if (conceptSet.has(kw)) score += kw.startsWith('g') ? 2 : 1; // group hits weigh more
  }
  return entry.strong && score > 0 ? score + 1 : score;
}

// --- follow-up handling ----------------------------------------------------

function handleFollowUp(text, ctx, properties) {
  const q = normalize(text);
  const last = ctx.lastResults || [];

  // "the first / second / third one" → detail on that result.
  // (Bare number words like "one" are intentionally excluded — "cheapest one"
  // is a superlative, not an ordinal reference.)
  const ordinals = { first: 0, '1st': 0, second: 1, '2nd': 1, third: 2, '3rd': 2 };
  const isSuperlative = /cheap|cheapest|expensive|priciest|best|lowest|highest/.test(q);
  if (!isSuperlative) {
    for (const [word, idx] of Object.entries(ordinals)) {
      if (new RegExp(`\\b${word}\\b`).test(q) && last[idx]) {
        return { text: describe(last[idx]), properties: [last[idx]] };
      }
    }
  }

  // "more info / details / tell me about it" → detail on the single last result
  if (/(more|detail|info|about|tell me).*(it|this|that|one|property|home)|^(more|details?|info)$/.test(q) && last.length === 1) {
    return { text: describe(last[0]), properties: [last[0]] };
  }

  // relative price / size follow-ups based on what was last shown
  if (last.length && ctx.lastFilters) {
    const f = { ...ctx.lastFilters };
    let changed = false;
    if (/cheaper|less expensive|lower|too expensive/.test(q)) {
      f.maxPrice = Math.min(...last.map((p) => priceToNumber(p.price))) - 1;
      delete f.minPrice; f.sort = 'asc'; changed = true;
    }
    if (/more expensive|pricier|higher|bigger budget|luxur/.test(q)) {
      f.minPrice = Math.max(...last.map((p) => priceToNumber(p.price))) + 1;
      delete f.maxPrice; f.sort = 'desc'; changed = true;
    }
    if (/more bed|bigger|larger|spacious/.test(q)) {
      f.minBeds = Math.max(...last.map((p) => bedsToNumber(p.beds))) + 1; changed = true;
    }
    if (changed) {
      const matches = matchProperties(f, properties).slice(0, 4);
      if (matches.length) {
        ctx.lastFilters = f; ctx.lastResults = matches;
        return { text: pick(['Here are a few that fit that better:', 'How about these:', 'These might suit you more:']), properties: matches };
      }
      return { text: 'I couldn’t find anything matching that adjustment. Want to try a different city or budget?' };
    }
  }
  return null;
}

// --- main factory ----------------------------------------------------------

export function createConcierge({ properties = [], agents = [], settings = {} } = {}) {
  const dedupe = (arr) => [...new Map(arr.map((v) => [v.toLowerCase(), v])).values()];
  const cities = dedupe(properties.map((p) => p.city).filter(Boolean));
  const countries = dedupe(properties.map((p) => p.country).filter(Boolean));
  const types = dedupe(properties.map((p) => p.type).filter(Boolean));

  const data = { properties, agents, cities, countries, types, settings };
  const knowledge = buildKnowledge(data);

  function greeting() {
    return "Welcome to Terra Estates. I'm your virtual concierge — ask me about properties, prices, locations, financing or booking a viewing.";
  }

  function respond(rawText, context = {}) {
    const ctx = { ...context };
    const text = (rawText || '').trim();
    if (!text) {
      return { text: 'I’m listening — tell me what you’re looking for.', properties: [], context: ctx, suggestions: baseSuggestions() };
    }

    const lower = normalize(text);

    // fuzzy greeting catch — handles typos like "helo", "heyy", "hii"
    const words = lower.split(' ');
    if (words.length <= 2 && words.some((w) => ['hi', 'hey', 'hello', 'yo', 'hiya'].some((g) => levenshtein(w, g) <= 1))) {
      const g = knowledge.find((e) => e.id === 'greeting');
      ctx.lastTopic = 'greeting';
      return finalize({ text: g.answer(ctx), properties: [] }, ctx, baseSuggestions());
    }

    // reset
    if (/\b(reset|start over|new search|clear)\b/.test(lower)) {
      delete ctx.lastFilters; delete ctx.lastResults; delete ctx.lastTopic;
      return { text: 'All clear — let’s start fresh. What would you like to find?', properties: [], context: ctx, suggestions: baseSuggestions() };
    }

    // booking intent → hand off to the Chatbot's guided booking flow.
    // Strong verbs (book/schedule/arrange/appointment) trigger directly; a
    // viewing word alone triggers only alongside an intent word, so "how do
    // viewings work?" stays informational.
    const bookingIntent = /\b(book|schedule|arrange|appointment|reserve)\b/.test(lower)
      || (/\b(viewing|visit|tour)\b/.test(lower) && /\b(want|like|can|could|set up|come|do)\b/.test(lower));
    if (bookingIntent) {
      // Attach a property only when exactly one was last shown.
      const property = ctx.lastResults && ctx.lastResults.length === 1 ? ctx.lastResults[0] : null;
      ctx.lastTopic = 'viewing';
      return {
        text: 'Let’s arrange a viewing.',
        properties: [],
        action: 'book_viewing',
        property,
        context: ctx,
        suggestions: [],
      };
    }

    // 1) contextual follow-ups ("cheaper", "the second one", "more info")
    const follow = handleFollowUp(text, ctx, properties);
    if (follow) {
      ctx.lastTopic = 'property';
      return finalize(follow, ctx, ['Show me something cheaper', 'Book a viewing', 'Talk to an agent']);
    }

    // 2) explicit property search (filters detected)
    const filters = parseFilters(text, { types, cities, countries });
    const conceptSet = concepts(text);

    // score the knowledge base
    let best = null;
    let bestScore = 0;
    for (const entry of knowledge) {
      const s = scoreEntry(entry, conceptSet);
      if (s > bestScore) { bestScore = s; best = entry; }
    }

    const strongProperty = hasFilterSignal(filters);
    // If a real filter is present AND it's not clearly a pure knowledge question,
    // run a property search. Knowledge wins only when it scores well and there's
    // no concrete filter (or the filter is just a sort word that the KB covers).
    const filterIsJustSort = filters.sort && !filters.type && !filters.city &&
      !filters.country && filters.maxPrice == null && filters.minPrice == null &&
      filters.minBeds == null && !filters.feature;

    if (strongProperty && !(filterIsJustSort && best && bestScore >= 3)) {
      const matches = matchProperties(filters, properties).slice(0, 4);
      ctx.lastFilters = filters;
      ctx.lastResults = matches;
      ctx.lastTopic = 'property';
      if (matches.length) {
        const label = filters.sort === 'asc'
          ? 'Here are our most affordable options'
          : filters.sort === 'desc'
            ? 'Here are our finest options'
            : `I found ${matches.length} ${matches.length === 1 ? 'property' : 'properties'} for you`;
        return finalize({ text: `${label}:`, properties: matches }, ctx, ['Something cheaper', 'More bedrooms', 'Book a viewing']);
      }
      return finalize({
        text: 'I couldn’t find an exact match. Try loosening a filter — a higher budget, a different city, or fewer must-haves. You could also say “reset” to start over.',
        properties: [],
      }, ctx, baseSuggestions());
    }

    // 3) knowledge base answer
    if (best && bestScore >= 2) {
      const out = best.answer(ctx);
      ctx.lastTopic = best.id;
      const result = typeof out === 'string' ? { text: out, properties: [] } : out;
      return finalize(result, ctx, suggestionsFor(best.id));
    }

    // 4) keyword fallback across listings (catch place/feature words we missed)
    const keywords = tokenize(text).filter((w) => w.length > 2);
    if (keywords.length) {
      const kwMatches = matchProperties({ keywords }, properties).slice(0, 4);
      if (kwMatches.length) {
        ctx.lastFilters = { keywords };
        ctx.lastResults = kwMatches;
        ctx.lastTopic = 'property';
        return finalize({ text: `Here’s what I found matching “${text}”:`, properties: kwMatches }, ctx, ['Something cheaper', 'Book a viewing', 'Talk to an agent']);
      }
    }

    // 5) graceful fallback
    return finalize({
      text: pick([
        "I’m not quite sure I caught that, but I can help you search listings, explain buying or selling, arrange a viewing, or connect you with an agent. Try “villa in Paris under €6M” or “how does buying work?”",
        "Let me help — I’m best at finding properties (“apartment with a pool”, “cheapest villa”) and answering questions about buying, selling, financing and viewings. What would you like to know?",
      ]),
      properties: [],
    }, ctx, baseSuggestions());
  }

  function finalize(result, ctx, suggestions) {
    return {
      text: result.text,
      properties: result.properties || [],
      context: ctx,
      suggestions: suggestions || baseSuggestions(),
    };
  }

  function baseSuggestions() {
    const c = cities[0] || 'Dubai';
    return [`Villas in ${c}`, 'Cheapest property', 'How does buying work?'];
  }

  function suggestionsFor(topicId) {
    const map = {
      financing: ['Show me listings', 'Talk to an agent', 'Buying process'],
      buying: ['Villas under $5M', 'Book a viewing', 'Financing options'],
      selling: ['Book a valuation', 'Talk to an agent', 'Your fees'],
      viewing: ['Show me listings', 'Talk to an agent'],
      locations: cities.slice(0, 3).map((c) => `Homes in ${c}`),
      agents: ['Talk to an agent', 'Show me listings'],
      investment: ['Best for investment', 'Talk to an agent'],
      about: ['Your services', 'Show me listings'],
    };
    return map[topicId] || baseSuggestions();
  }

  return { greeting, respond };
}

export default createConcierge;
