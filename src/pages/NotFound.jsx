import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Chatbot from '../components/Chatbot';
import Seo from '../components/Seo';

export default function NotFound() {
  return (
    <>
    <Seo title="Page Not Found" noindex />
    <div
      className="min-h-screen flex items-center justify-center px-6 bg-cover bg-center relative"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1974&auto=format&fit=crop')" }}
    >
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 text-center text-white max-w-2xl mx-auto">
        <p className="uppercase tracking-[0.4em] text-sm text-[#C0A067] mb-4">Terra Estates</p>

        <h1 className="font-display text-[10rem] md:text-[14rem] leading-none font-bold text-white/10 select-none">
          404
        </h1>

        <div className="-mt-8 md:-mt-12">
          <h2 className="font-display text-4xl md:text-5xl mb-4">Page Not Found</h2>
          <p className="text-gray-300 text-lg max-w-md mx-auto leading-relaxed">
            The page you're looking for doesn't exist or may have been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <Link
            to="/"
            className="flex items-center gap-2 bg-[#C0A067] text-black px-7 py-3.5 rounded-xl font-semibold hover:bg-[#a98952] transition-all duration-300"
          >
            <Home className="w-4 h-4" /> Back to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 border border-white/30 text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-gray-400">
          {[['/', 'Home'], ['/properties', 'Properties'], ['/agents', 'Agents'], ['/about', 'About'], ['/contact', 'Contact']].map(([path, label]) => (
            <Link key={path} to={path} className="hover:text-[#C0A067] transition">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
    <Chatbot />
    </>
  );
}
