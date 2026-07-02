import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function Toast({ show, message, actionLabel, actionTo, onClose }) {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-charcoal text-ivory pl-4 pr-2 py-3 rounded-full shadow-2xl animate-fade-up">
      <Heart className="w-4 h-4 text-soft-gold flex-shrink-0" />
      <span className="text-sm font-medium whitespace-nowrap">{message}</span>
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          onClick={onClose}
          className="bg-soft-gold text-charcoal text-xs font-semibold px-4 py-2 rounded-full hover:bg-dark-gold transition-colors whitespace-nowrap"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
