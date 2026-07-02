import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Heart } from 'lucide-react';
import { getProperties, getFavorites, toggleFavorite } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import NewsletterForm from '../components/NewsletterForm';
import Chatbot from '../components/Chatbot';
import Toast from '../components/Toast';

function PropertyCardImage({ images, alt }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const timer = setInterval(() => setIndex(i => (i + 1) % images.length), 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  return <img className="w-full h-[260px] object-cover" src={images[index]} alt={alt} />;
}

export default function Properties() {
  const [allProperties, setAllProperties] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const [showLoginToast, setShowLoginToast] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    setAllProperties(getProperties());
    setFavorites(getFavorites());
  }, []);

  const handleToggleFav = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      setShowLoginToast(true);
      return;
    }
    setFavorites(toggleFavorite(id));
  };

  const types = [...new Set(allProperties.map(p => p.type))];
  const cities = [...new Set(allProperties.map(p => p.city))];
  const countries = [...new Set(allProperties.map(p => p.country))];

  const filtered = allProperties.filter(p => {
    const text = `${p.title} ${p.city} ${p.country} ${p.type}`.toLowerCase();
    return (
      text.includes(search.toLowerCase()) &&
      (typeFilter === 'all' || p.type === typeFilter) &&
      (cityFilter === 'all' || p.city === cityFilter) &&
      (countryFilter === 'all' || p.country === countryFilter)
    );
  });

  return (
    <>
      {/* Hero */}
      <section className="pt-28 md:pt-36 pb-10 md:pb-16 px-4 md:px-6 text-center">
        <h2 className="font-display text-3xl sm:text-5xl md:text-6xl">Discover Luxury Properties</h2>
        <p className="mt-4 md:mt-5 text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
          Explore premium apartments, penthouses, villas, and estates across the world's most iconic destinations.
        </p>
      </section>

      {/* Filters */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 mb-10 md:mb-16">
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          <div>
            <label className="text-sm text-gray-500">Search</label>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search properties..."
              className="w-full mt-2 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-[#C0A067]"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500">Property Type</label>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="w-full mt-2 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-[#C0A067]">
              <option value="all">All Types</option>
              {types.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-500">City</label>
            <select value={cityFilter} onChange={e => setCityFilter(e.target.value)} className="w-full mt-2 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-[#C0A067]">
              <option value="all">All Cities</option>
              {cities.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-500">Country</label>
            <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)} className="w-full mt-2 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-[#C0A067]">
              <option value="all">All Countries</option>
              {countries.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pb-12 md:pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {filtered.length === 0 ? (
            <p className="col-span-3 text-center text-gray-500 py-16 text-lg">No properties match your filters.</p>
          ) : filtered.map(p => (
            <div key={p.id} className="property-card bg-white rounded-2xl overflow-hidden shadow-lg">
              <div className="relative">
                <PropertyCardImage images={[p.img, ...(p.extraPhotos || []).filter(Boolean)]} alt={p.title} />
                <button
                  onClick={e => handleToggleFav(e, p.id)}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow hover:scale-110 transition-transform duration-200"
                  aria-label={favorites.includes(p.id) ? 'Remove from saved' : 'Save property'}
                >
                  <Heart className={`w-5 h-5 transition-colors duration-200 ${favorites.includes(p.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </button>
              </div>
              <div className="p-6 flex-1">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm bg-[#C0A067]/10 text-[#C0A067] px-3 py-1 rounded-full">{p.type}</span>
                  <span className="font-bold text-xl">{p.price}</span>
                </div>
                <h3 className="font-display text-2xl">{p.title}</h3>
                <p className="text-gray-500 mt-2">{p.city}, {p.country}</p>
                <div className="flex justify-between mt-6 text-sm text-gray-500">
                  <span>{p.beds}</span>
                  <span>{p.baths}</span>
                  <span>{p.size}</span>
                </div>
              </div>
              <Link
                to={`/properties/${p.id}`}
                className="block w-full text-center bg-charcoal text-ivory px-6 py-3 font-semibold hover:bg-soft-gold hover:text-charcoal transition-all duration-300"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#141414] text-white/70 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div>
              <h3 className="font-display text-3xl font-bold text-white mb-4">Elysian</h3>
              <p className="text-sm mb-6 max-w-xs">The new standard in luxury real estate.</p>
              <h4 className="text-lg font-semibold text-white mb-4">Join Our Newsletter</h4>
              <NewsletterForm />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {[['/', 'Home'], ['/properties', 'Properties'], ['/agents', 'Our Agents'], ['/about', 'About Us'], ['/contact', 'Contact']].map(([path, label]) => (
                  <li key={path}><Link to={path} className="hover:text-[#C0A067] transition">{label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-6">Contact Us</h4>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start"><MapPin className="w-5 h-5 mr-3 mt-0.5 text-[#C0A067] flex-shrink-0" /><span>123 Luxury Ave, Beverly Hills, CA 90210</span></li>
                <li className="flex items-center"><Phone className="w-5 h-5 mr-3 text-[#C0A067]" /><span>+1 (310) 555-0123</span></li>
                <li className="flex items-center"><Mail className="w-5 h-5 mr-3 text-[#C0A067]" /><span>inquiries@elysian.com</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-6">Follow Us</h4>
              <div className="flex gap-5">
                {[0,1,2,3].map(i => <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#C0A067] transition duration-300" />)}
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 mt-16 pt-8 text-center text-sm">
            <p>© {new Date().getFullYear()} Elysian Estates. All Rights Reserved | Designed with Elegance | Made by <a href="https://ndris-dubova.netlify.app/" className="hover:text-[#C0A067]">Ndris Dubova</a></p>
          </div>
        </div>
      </footer>
      <Chatbot />
      <Toast
        show={showLoginToast}
        message="Login to save properties"
        actionLabel="Login"
        actionTo="/login"
        onClose={() => setShowLoginToast(false)}
      />
    </>
  );
}
