import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
import NewsletterForm from './NewsletterForm';

export default function Footer() {
  return (
    <footer className="bg-charcoal text-ivory/70 pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand & Newsletter */}
          <div>
            <h3 className="font-display text-3xl font-bold text-white mb-4">Terra</h3>
            <p className="text-sm mb-6 max-w-xs">The new standard in luxury real estate.</p>
            <h4 className="text-lg font-semibold text-white mb-4">Join Our Newsletter</h4>
            <NewsletterForm />
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {[['/', 'Home'], ['/properties', 'Properties'], ['/agents', 'Our Agents'], ['/blog', 'Journal'], ['/about', 'About Us'], ['/contact', 'Contact']].map(([path, label]) => (
                <li key={path}>
                  <Link to={path} className="hover:text-soft-gold transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 mt-1 text-soft-gold flex-shrink-0" />
                <span>123 Luxury Ave, Beverly Hills, CA 90210</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-soft-gold" />
                <span>+1 (310) 555-0123</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-soft-gold" />
                <span>inquiries@terra.com</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Follow Us</h4>
            <div className="flex space-x-5">
              {[0, 1, 2, 3].map(i => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-ivory/10 flex items-center justify-center hover:bg-soft-gold transition-all duration-300" />
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-ivory/20 mt-16 pt-8 text-center text-sm">
          <p>
            © {new Date().getFullYear()} Terra Estates. All Rights Reserved. | Designed with Elegance |{' '}
            Made by <a href="https://ndris-dubova.netlify.app/" className="hover:text-soft-gold transition-colors">Ndris Dubova</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
