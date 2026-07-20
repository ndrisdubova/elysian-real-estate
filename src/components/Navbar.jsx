import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../hooks/useFavorites';
import { getProperties } from '../utils/storage';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [favOpen, setFavOpen] = useState(false);
  const { favorites, toggleFavorite } = useFavorites();
  const [allProperties, setAllProperties] = useState([]);
  const { currentUser, logoutUser } = useAuth();
  const location = useLocation();
  const profileRef = useRef(null);

  useEffect(() => {
    getProperties().then(setAllProperties);
  }, []);

  const savedProperties = allProperties.filter(p => favorites.includes(p.id));

  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    // `overflow: hidden` on body doesn't stop iOS Safari from rubber-banding the
    // page behind a fixed overlay on a fast swipe. Pinning the body in place with
    // `position: fixed` (and restoring the scroll offset on close) actually locks it.
    if (menuOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (scrollY) window.scrollTo(0, -parseInt(scrollY, 10));
    }
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const logoColor = isHome
    ? (scrolled || menuOpen ? 'text-charcoal' : 'text-ivory')
    : 'text-charcoal';

  const linkColor = isHome
    ? (scrolled ? 'text-charcoal/80 hover:text-soft-gold' : 'text-ivory/80 hover:text-soft-gold')
    : 'text-gray-600 hover:text-soft-gold';

  const ctaClass = isHome
    ? (scrolled
        ? 'bg-charcoal text-ivory hover:bg-soft-gold hover:text-charcoal'
        : 'bg-ivory text-charcoal hover:bg-soft-gold hover:text-charcoal')
    : 'bg-black text-white hover:bg-gray-800';

  const hamburgerColor = isHome
    ? (scrolled || menuOpen ? 'bg-charcoal' : 'bg-ivory')
    : 'bg-charcoal';

  const headerBg = isHome ? '' : 'bg-white border-b';

  return (
    <>
      <header
        id="navbar"
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${headerBg} ${scrolled && isHome ? 'scrolled' : ''}`}
      >
        <div className="container mx-auto px-6 py-5 flex justify-between items-center">
          <Link to="/" className={`font-display text-3xl font-bold tracking-wide transition-colors duration-300 ${logoColor}`}>
            Terra
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex space-x-8 items-center">
            {[['/', 'Home'], ['/properties', 'Properties'], ['/agents', 'Agents'], ['/about', 'About']].map(([path, label]) => (
              <Link
                key={path}
                to={path}
                className={`transition-colors duration-300 nav-link-desktop ${linkColor} ${location.pathname === path ? 'text-soft-gold' : ''}`}
              >
                {label}
              </Link>
            ))}

            {currentUser ? (
              <div className="auth-profile-menu" ref={profileRef}>
                <button
                  className="auth-profile-btn"
                  onClick={() => setProfileOpen(o => !o)}
                  aria-label="Open profile menu"
                >
                  <img src={currentUser.avatar} alt={currentUser.name} className="auth-profile-img" />
                </button>
                {profileOpen && (
                  <div className="auth-profile-dropdown">
                    <div className="auth-profile-header">
                      <img src={currentUser.avatar} alt="" className="auth-profile-dropdown-img" />
                      <div>
                        <p className="auth-profile-name">{currentUser.name}</p>
                        <p className="auth-profile-email">{currentUser.email}</p>
                      </div>
                    </div>
                    <Link to="/account" className="auth-menu-link" onClick={() => setProfileOpen(false)}>
                      My Account
                    </Link>
                    <button className="auth-logout-btn" onClick={() => { logoutUser(); setProfileOpen(false); }}>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className={`transition-colors duration-300 ${linkColor}`}>Login</Link>
                <Link to="/signup" className={`transition-colors duration-300 ${linkColor}`}>Sign Up</Link>
              </>
            )}

            <button
              onClick={() => setFavOpen(o => !o)}
              className={`relative p-2 rounded-full transition-colors duration-300 hover:text-soft-gold ${linkColor}`}
              aria-label="Saved properties"
            >
              <Heart className={`w-5 h-5 ${favorites.length > 0 ? 'fill-red-500 text-red-500' : ''}`} />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-soft-gold text-charcoal text-[10px] font-bold rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </button>

            <Link
              to="/contact"
              className={`px-6 py-3 rounded-md text-sm font-semibold shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 ${ctaClass}`}
            >
              Contact Us
            </Link>
          </nav>

          <div className="lg:hidden w-[28px] h-[36px]" />
        </div>
      </header>

      {/* Hamburger */}
      <button
        className={`lg:hidden z-[60] hamburger fixed top-5 right-6 ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(o => !o)}
        aria-label="Toggle menu"
      >
        <span className={hamburgerColor} />
        <span className={hamburgerColor} />
        <span className={hamburgerColor} />
      </button>

      {/* Saved Properties Panel */}
      <div
        className={`fixed inset-0 z-[70] flex justify-end transition-all duration-300 ${favOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        onClick={() => setFavOpen(false)}
      >
        {/* Backdrop */}
        <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${favOpen ? 'opacity-100' : 'opacity-0'}`} />

        {/* Panel */}
        <div
          className={`relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${favOpen ? 'translate-x-0' : 'translate-x-full'}`}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b bg-charcoal text-ivory">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 fill-red-400 text-red-400" />
              <h2 className="font-display text-xl font-bold">Saved Properties</h2>
            </div>
            <button onClick={() => setFavOpen(false)} aria-label="Close">
              <X className="w-5 h-5 text-ivory/70 hover:text-ivory" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {!currentUser ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400 px-6">
                <Heart className="w-12 h-12 text-gray-200" />
                <p className="text-center text-sm">Login to save properties.</p>
                <Link
                  to="/login"
                  onClick={() => setFavOpen(false)}
                  className="mt-2 px-6 py-3 bg-charcoal text-ivory text-sm font-semibold rounded-md hover:bg-soft-gold hover:text-charcoal transition-all duration-300"
                >
                  Login
                </Link>
              </div>
            ) : savedProperties.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400 px-6">
                <Heart className="w-12 h-12 text-gray-200" />
                <p className="text-center text-sm">No saved properties yet.<br />Click the heart on any property to save it.</p>
                <Link
                  to="/properties"
                  onClick={() => setFavOpen(false)}
                  className="mt-2 px-6 py-3 bg-charcoal text-ivory text-sm font-semibold rounded-md hover:bg-soft-gold hover:text-charcoal transition-all duration-300"
                >
                  Browse Properties
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {savedProperties.map(p => (
                  <li key={p.id} className="flex gap-3 p-4 hover:bg-gray-50 transition-colors">
                    <img src={p.img} alt={p.title} className="w-20 h-16 object-cover rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-charcoal text-sm truncate">{p.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{p.city}, {p.country}</p>
                      <p className="text-soft-gold font-bold text-sm mt-1">{p.price}</p>
                      <Link
                        to={`/properties/${p.id}`}
                        onClick={() => setFavOpen(false)}
                        className="text-xs text-charcoal underline hover:text-soft-gold mt-1 inline-block"
                      >
                        View Details
                      </Link>
                    </div>
                    <button
                      onClick={() => toggleFavorite(p.id)}
                      className="p-1 text-gray-300 hover:text-red-400 transition-colors self-start flex-shrink-0"
                      aria-label="Remove from saved"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {savedProperties.length > 0 && (
            <div className="p-4 border-t space-y-2">
              <Link
                to="/saved"
                onClick={() => setFavOpen(false)}
                className="block w-full text-center bg-soft-gold text-charcoal py-3 rounded-md text-sm font-semibold hover:bg-dark-gold transition-all duration-300"
              >
                View Saved Page
              </Link>
              <Link
                to="/properties"
                onClick={() => setFavOpen(false)}
                className="block w-full text-center bg-charcoal text-ivory py-3 rounded-md text-sm font-semibold hover:bg-soft-gold hover:text-charcoal transition-all duration-300"
              >
                Browse All Properties
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Full-screen Nav Overlay */}
      <div className={`nav-overlay fixed inset-0 bg-charcoal z-[55] overflow-y-auto overscroll-contain ${menuOpen ? 'open' : ''}`}>
        <div className="min-h-full flex flex-col items-center justify-center gap-6 sm:gap-8 py-24 px-6">
          {[['/', 'Home'], ['/properties', 'Properties'], ['/agents', 'Agents'], ['/about', 'About'], ['/contact', 'Contact']].map(([path, label]) => (
            <Link key={path} to={path} className="text-ivory text-3xl sm:text-4xl font-display" onClick={() => setMenuOpen(false)}>
              {label}
            </Link>
          ))}
          <button
            onClick={() => { setMenuOpen(false); setFavOpen(true); }}
            className="flex items-center gap-3 text-ivory text-3xl sm:text-4xl font-display"
          >
            <Heart className={`w-6 h-6 sm:w-7 sm:h-7 ${favorites.length > 0 ? 'fill-red-500 text-red-500' : ''}`} />
            Saved
            {favorites.length > 0 && (
              <span className="w-6 h-6 bg-soft-gold text-charcoal text-sm font-sans font-bold rounded-full flex items-center justify-center">
                {favorites.length}
              </span>
            )}
          </button>
          {currentUser ? (
            <div className="auth-mobile-profile">
              <img src={currentUser.avatar} alt={currentUser.name} className="auth-mobile-profile-img" />
              <p className="auth-mobile-profile-name">{currentUser.name}</p>
              <p className="auth-mobile-profile-email">{currentUser.email}</p>
              <Link to="/account" className="text-ivory/90 text-lg underline mt-2" onClick={() => setMenuOpen(false)}>My Account</Link>
              <button className="auth-mobile-logout-btn" onClick={() => { logoutUser(); setMenuOpen(false); }}>Logout</button>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-ivory text-3xl sm:text-4xl font-display" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/signup" className="text-ivory text-3xl sm:text-4xl font-display" onClick={() => setMenuOpen(false)}>Signup</Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
