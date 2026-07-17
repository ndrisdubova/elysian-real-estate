import { useParams, Link, useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import { MapPin, Bed, Bath, Ruler, ArrowLeft, CheckCircle, X, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { getProperties, addMessage } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../hooks/useFavorites';
import Toast from '../components/Toast';
import Seo from '../components/Seo';

function Lightbox({ photos, index, onClose }) {
  const [current, setCurrent] = useState(index);
  const prev = () => setCurrent(i => (i - 1 + photos.length) % photos.length);
  const next = () => setCurrent(i => (i + 1) % photos.length);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white p-2">
        <X className="w-6 h-6" />
      </button>
      <button onClick={e => { e.stopPropagation(); prev(); }} className="absolute left-4 text-white/70 hover:text-white p-2">
        <ChevronLeft className="w-8 h-8" />
      </button>
      <img
        src={photos[current]}
        alt=""
        className="max-h-[85vh] max-w-[90vw] object-contain"
        onClick={e => e.stopPropagation()}
      />
      <button onClick={e => { e.stopPropagation(); next(); }} className="absolute right-4 text-white/70 hover:text-white p-2">
        <ChevronRight className="w-8 h-8" />
      </button>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {photos.map((_, i) => (
          <button
            key={i}
            onClick={e => { e.stopPropagation(); setCurrent(i); }}
            className={`w-2 h-2 rounded-full transition ${i === current ? 'bg-white' : 'bg-white/30'}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const formRef = useRef(null);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [lightbox, setLightbox] = useState(null);
  const { favorites, toggleFavorite } = useFavorites();
  const [heroIndex, setHeroIndex] = useState(0);
  const { currentUser } = useAuth();
  const [showLoginToast, setShowLoginToast] = useState(false);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProperties().then(list => { setProperties(list); setLoading(false); });
  }, []);

  const handleToggleFav = () => {
    if (!currentUser) {
      setShowLoginToast(true);
      return;
    }
    toggleFavorite(property.id);
  };

  const property = properties.find(p => p.id === Number(id));
  const allPhotos = property ? [property.img, ...(property.extraPhotos || []).filter(Boolean)] : [];

  useEffect(() => { setHeroIndex(0); }, [property?.id]);

  useEffect(() => {
    if (allPhotos.length < 2) return;
    const timer = setInterval(() => setHeroIndex(i => (i + 1) % allPhotos.length), 5000);
    return () => clearInterval(timer);
  }, [allPhotos.length, property?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gray-200 border-t-charcoal rounded-full animate-spin" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="font-display text-4xl">Property not found</h2>
        <Link to="/properties" className="text-soft-gold hover:underline">← Back to Properties</Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      const fd = new FormData(formRef.current);
      const fullName = fd.get('first_name') || '';
      const nameParts = fullName.trim().split(' ');
      await addMessage({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: fd.get('email') || '',
        phone: fd.get('phone') || '',
        subject: `Enquiry: ${property.title}`,
        message: fd.get('message') || '',
        property: property.title,
        propertyImg: property.img,
      });
      await emailjs.sendForm(
        'service_gkwnn4k',
        'template_j7abcbp',
        formRef.current,
        'yXRguh-oDkNVwjAWI'
      );
      setSuccess(true);
      formRef.current.reset();
      setTimeout(() => setSuccess(false), 5000);
    } catch {
      setError('Failed to send. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-[#f7f7f7] min-h-screen">
      <Seo
        title={`${property.title} — ${property.type} in ${property.city}`}
        description={`${property.price} · ${property.beds} · ${property.baths} · ${property.size}. ${property.description || ''}`}
        image={property.img}
        type="article"
      />
      {/* Hero Image */}
      <div className="relative h-[55vh] md:h-[65vh] w-full overflow-hidden">
        <img src={allPhotos[heroIndex]} alt={property.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        <button
          onClick={() => navigate('/properties')}
          className="absolute top-6 left-6 flex items-center gap-2 bg-white/20 backdrop-blur-md text-white border border-white/30 px-4 py-2 rounded-full text-sm font-medium hover:bg-white/30 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Properties
        </button>
        <button
          onClick={handleToggleFav}
          className="absolute top-24 right-6 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200"
          aria-label={favorites.includes(property.id) ? 'Remove from saved' : 'Save property'}
        >
          <Heart className={`w-5 h-5 transition-colors duration-200 ${favorites.includes(property.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
        </button>

        {allPhotos.length > 1 && (
          <button
            onClick={() => setLightbox(0)}
            className="absolute bottom-6 right-6 bg-white/20 backdrop-blur-md text-white border border-white/30 px-4 py-2 rounded-full text-sm font-medium hover:bg-white/30 transition-all"
          >
            View all {allPhotos.length} photos
          </button>
        )}

        <div className="absolute bottom-5 left-4 right-4 md:bottom-8 md:left-8 md:right-8">
          <span className="inline-block bg-soft-gold text-charcoal text-xs font-bold uppercase px-3 py-1 rounded-full mb-2">
            {property.type}
          </span>
          <h1 className="font-display text-2xl sm:text-4xl md:text-6xl font-bold text-white leading-tight">
            {property.title}
          </h1>
          <p className="flex items-center text-white/80 mt-2 text-sm md:text-lg">
            <MapPin className="w-4 h-4 mr-2 text-soft-gold" />
            {property.city}, {property.country}
          </p>
        </div>
      </div>

      {(property.extraPhotos || []).filter(Boolean).length > 0 && (
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {(property.extraPhotos || []).filter(Boolean).map((photo, i) => (
              <button
                key={i}
                onClick={() => setLightbox(i + 1)}
                className="flex-shrink-0 w-28 h-20 md:w-36 md:h-24 rounded-xl overflow-hidden hover:opacity-90 transition ring-2 ring-transparent hover:ring-[#C0A067]"
              >
                <img src={photo} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 grid lg:grid-cols-5 gap-6 lg:gap-12">
        {/* Left — Details */}
        <div className="lg:col-span-3 space-y-8">
          {/* Price + stats */}
          <div className="bg-white rounded-2xl shadow-md p-5 md:p-8">
            <p className="font-display text-3xl md:text-5xl font-bold text-charcoal mb-4 md:mb-6">
              {property.price}
            </p>
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              {[
                { Icon: Bed, label: 'Bedrooms', value: property.beds },
                { Icon: Bath, label: 'Bathrooms', value: property.baths },
                { Icon: Ruler, label: 'Size', value: property.size },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="bg-[#f7f7f7] rounded-xl p-4 text-center">
                  <Icon className="w-6 h-6 text-soft-gold mx-auto mb-2" />
                  <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
                  <p className="font-semibold text-charcoal mt-1">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl shadow-md p-5 md:p-8">
            <h2 className="font-display text-xl md:text-2xl font-bold text-charcoal mb-3 md:mb-4">About This Property</h2>
            <p className="text-gray-600 leading-relaxed text-base md:text-lg">{property.description}</p>
          </div>

          {/* Features */}
          {property.features && property.features.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-5 md:p-8">
              <h2 className="font-display text-xl md:text-2xl font-bold text-charcoal mb-4 md:mb-6">Key Features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {property.features.map(f => (
                  <div key={f} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-soft-gold flex-shrink-0" />
                    <span className="text-gray-700">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-md p-5 md:p-8 lg:sticky lg:top-28">
            <h2 className="font-display text-xl md:text-2xl font-bold text-charcoal mb-2">Enquire About This Property</h2>
            <p className="text-gray-500 text-sm mb-6">Fill in your details and an agent will get back to you shortly.</p>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" name="subject" value={`Enquiry: ${property.title}`} />
              <div>
                <label className="block text-sm text-gray-500 mb-1">Full Name</label>
                <input type="text" name="first_name" placeholder="Your full name" required className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#C0A067] focus:shadow-[0_0_0_3px_rgba(192,160,103,0.15)] transition text-base" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Email</label>
                <input type="email" name="email" placeholder="your@email.com" required className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#C0A067] focus:shadow-[0_0_0_3px_rgba(192,160,103,0.15)] transition text-base" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Phone (optional)</label>
                <input type="tel" name="phone" placeholder="+1 (000) 000-0000" className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#C0A067] focus:shadow-[0_0_0_3px_rgba(192,160,103,0.15)] transition text-base" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Message</label>
                <textarea rows={4} name="message" placeholder={`I'm interested in ${property.title}...`} className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#C0A067] focus:shadow-[0_0_0_3px_rgba(192,160,103,0.15)] transition text-base resize-none" />
              </div>
              <button type="submit" disabled={sending} className="w-full bg-charcoal text-ivory py-3.5 rounded-xl font-semibold hover:bg-soft-gold hover:text-charcoal transition-all duration-300 disabled:opacity-60 text-sm">
                {sending ? 'Sending…' : 'Send Enquiry'}
              </button>
            </form>

            {success && (
              <div className="mt-4 bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
                Your enquiry has been sent. We'll be in touch soon!
              </div>
            )}
            {error && (
              <div className="mt-4 bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">{error}</div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">Or call us directly</p>
              <a href="tel:+13105550123" className="text-charcoal font-semibold hover:text-soft-gold transition-colors">
                +1 (310) 555-0123
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <Lightbox photos={allPhotos} index={lightbox} onClose={() => setLightbox(null)} />
      )}

      <Toast
        show={showLoginToast}
        message="Login to save properties"
        actionLabel="Login"
        actionTo="/login"
        onClose={() => setShowLoginToast(false)}
      />
    </div>
  );
}
