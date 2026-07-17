import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin } from 'lucide-react';
import { getProperties } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../hooks/useFavorites';
import Seo from '../components/Seo';

// Simple empty / logged-out state block.
function EmptyState({ message, cta }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-24 text-gray-400">
      <Heart className="w-14 h-14 text-gray-200" />
      <p className="text-center max-w-xs">{message}</p>
      <Link
        to={cta.to}
        className="mt-2 px-8 py-3 bg-charcoal text-ivory text-sm font-semibold rounded-md hover:bg-soft-gold hover:text-charcoal transition-all duration-300"
      >
        {cta.label}
      </Link>
    </div>
  );
}

export default function Saved() {
  const { currentUser } = useAuth();
  const { favorites, toggleFavorite } = useFavorites();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProperties().then((p) => { setProperties(p); setLoading(false); });
  }, []);

  const saved = properties.filter((p) => favorites.includes(p.id));

  return (
    <>
      <Seo title="Saved Properties" noindex />
      <section className="pt-28 md:pt-36 pb-16 px-4 md:px-6 max-w-7xl mx-auto min-h-screen">
        <div className="text-center mb-8 md:mb-10">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl flex items-center justify-center gap-2 sm:gap-3">
            <Heart className="w-6 h-6 sm:w-8 sm:h-8 fill-red-500 text-red-500 flex-shrink-0" /> My Saved Homes
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-500 px-4">The properties you&rsquo;ve hearted, all in one place.</p>
        </div>

        {!currentUser ? (
          <EmptyState message="Log in to see the homes you've saved." cta={{ to: '/login', label: 'Login' }} />
        ) : loading ? (
          <p className="text-center text-gray-400 py-24">Loading your saved homes…</p>
        ) : saved.length === 0 ? (
          <EmptyState
            message="You haven't saved any homes yet. Tap the heart on any property to save it here."
            cta={{ to: '/properties', label: 'Browse Properties' }}
          />
        ) : (
          <>
            <p className="text-center text-sm text-gray-400 mb-8">
              {saved.length} saved {saved.length === 1 ? 'home' : 'homes'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
              {saved.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl overflow-hidden shadow-lg flex flex-col">
                  <div className="relative">
                    <img src={p.img} alt={p.title} loading="lazy" decoding="async" className="w-full h-[260px] object-cover" />
                    <button
                      onClick={() => toggleFavorite(p.id)}
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow hover:scale-110 transition-transform duration-200"
                      aria-label="Remove from saved"
                    >
                      <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                    </button>
                  </div>
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm bg-[#C0A067]/10 text-[#C0A067] px-3 py-1 rounded-full">{p.type}</span>
                      <span className="font-bold text-xl">{p.price}</span>
                    </div>
                    <h3 className="font-display text-2xl">{p.title}</h3>
                    <p className="text-gray-500 mt-2 flex items-center gap-1"><MapPin className="w-4 h-4" /> {p.city}, {p.country}</p>
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
          </>
        )}
      </section>
    </>
  );
}
