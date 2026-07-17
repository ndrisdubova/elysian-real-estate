import { Wrench } from 'lucide-react';

// Shown to every public visitor while maintenance mode is enabled.
// Admin routes (/admin/*) bypass this so the team can toggle it back off.
export default function Maintenance() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-charcoal text-ivory px-6 text-center">
      <div className="max-w-lg">
        <div className="w-16 h-16 mx-auto mb-8 rounded-full bg-soft-gold/15 text-soft-gold flex items-center justify-center">
          <Wrench className="w-8 h-8" />
        </div>
        <span className="text-soft-gold font-semibold tracking-widest uppercase text-sm">Terra Estates</span>
        <h1 className="font-display text-4xl md:text-5xl font-bold mt-4 mb-6">
          We&rsquo;ll be back soon
        </h1>
        <p className="text-lg text-ivory/70 leading-relaxed mb-10">
          Our site is undergoing scheduled maintenance to bring you an even better
          experience. Please check back shortly — we appreciate your patience.
        </p>
        <div className="text-ivory/60 text-sm space-y-1">
          <p>Need to reach us in the meantime?</p>
          <p>
            <a href="tel:+38348773388" className="text-soft-gold hover:text-dark-gold font-semibold">+383 48 77 33 88</a>
            {' · '}
            <a href="mailto:info.terra@gmail.com" className="text-soft-gold hover:text-dark-gold font-semibold">info.terra@gmail.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
