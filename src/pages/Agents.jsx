import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAgents } from '../utils/storage';
import NewsletterForm from '../components/NewsletterForm';
import Chatbot from '../components/Chatbot';
import Seo from '../components/Seo';

// "Ndris Dubova" -> "ND". Falls back to the first letter, then a dash.
function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '—';
  return parts.slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

// Shows the agent's photo when one is set (and loads); otherwise a tidy
// initials monogram so photo-less agents still look intentional.
function AgentAvatar({ name, img, size }) {
  const [failed, setFailed] = useState(false);
  const box = `${size} rounded-full mx-auto mb-4`;
  if (img && !failed) {
    return (
      <img
        className={`${box} object-cover`}
        src={img}
        alt={name}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div
      className={`${box} flex items-center justify-center bg-gradient-to-br from-[#C0A067] to-[#a5824d] text-white font-display tracking-wide select-none`}
      role="img"
      aria-label={name || 'Agent'}
    >
      {initials(name)}
    </div>
  );
}

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getAgents().then(a => { setAgents(a); setLoading(false); }); }, []);

  const founders = agents.filter(a => a.type === 'founder');
  const experts = agents.filter(a => a.type === 'expert');

  return (
    <>
      <Seo
        title="Meet Our Agents"
        description="A hand-picked network of world-class real-estate experts, founders and advisors ready to guide you through your luxury property journey."
      />
      {/* Hero */}
      <section className="pt-28 text-center px-6">
        <h2 className="font-display text-5xl md:text-6xl">Meet Our Elite Network</h2>
        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
          A hand-picked group of world-class experts, founders, and advisors shaping luxury real estate.
        </p>
      </section>

      
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h3 className="font-display text-4xl text-center">Our Founders</h3>
        {founders.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-10 mt-12">
            {founders.map(f => (
              <div key={f.id} className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition text-center">
                <AgentAvatar name={f.name} img={f.img} size="w-28 h-28 text-3xl" />
                <h4 className="font-bold text-lg">{f.name}</h4>
                <p className="text-gray-600">{f.role}</p>
                <p className="text-sm text-gray-500 mt-2">{f.bio}</p>
              </div>
            ))}
          </div>
        ) : !loading ? (
          <p className="text-center text-gray-500 mt-12 text-lg">
            {agents.length === 0 ? 'There are no agents at the moment. Please check back soon.' : 'No founders listed yet.'}
          </p>
        ) : null}
      </section>

      {/* Experts */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h3 className="font-display text-4xl">Our Experts</h3>
            <p className="text-gray-600 mt-4">
              Specialists in investment, architecture, market strategy and luxury advisory.
              A global team shaping the future of elite real estate.
            </p>
          </div>
          <div>
            <img className="rounded-xl shadow-lg" src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80" alt="Team" loading="lazy" decoding="async" />
          </div>
        </div>
        {experts.length > 0 ? (
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 mt-16">
            {experts.map(e => (
              <div key={e.id} className="p-6 bg-gray-50 rounded-xl shadow hover:shadow-lg transition text-center">
                <AgentAvatar name={e.name} img={e.img} size="w-20 h-20 text-2xl" />
                <h4 className="font-bold">{e.name}</h4>
                <p className="text-gray-600">{e.role}</p>
              </div>
            ))}
          </div>
        ) : !loading && agents.length > 0 ? (
          <p className="max-w-6xl mx-auto text-center text-gray-500 mt-16 text-lg">No experts listed yet.</p>
        ) : null}
      </section>

      {/* Why Stand Out */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h3 className="font-display text-4xl">Why Our Team Stands Out</h3>
        <p className="text-gray-600 mt-4 max-w-3xl mx-auto">
          We combine experience, innovation and global connections to deliver unmatched luxury service.
        </p>
      </section>

      {/* Footer */}
      <footer className="bg-[#141414] text-white pt-20 pb-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <h3 className="font-display text-3xl font-bold mb-4">Terra</h3>
              <p className="text-gray-400 text-sm">The new standard in luxury real estate.</p>
              <h4 className="mt-8 mb-3 font-semibold">Join Our Newsletter</h4>
              <NewsletterForm />
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-3 text-gray-400">
                {[['/', 'Home'], ['/properties', 'Properties'], ['/agents', 'Our Agents'], ['/about', 'About Us'], ['/contact', 'Contact']].map(([path, label]) => (
                  <li key={path}><Link className="hover:text-white" to={path}>{label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-6">Contact Us</h4>
              <div className="space-y-4 text-gray-400 text-sm">
                <p>123 Luxury Ave, Beverly Hills</p>
                <p>+1 (310) 555-0123</p>
                <p>inquiries@terra.com</p>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-6">Follow Us</h4>
              <div className="flex gap-4">
                {[0,1,2,3].map(i => <div key={i} className="w-10 h-10 bg-white/10 rounded-full" />)}
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 mt-16 pt-6 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Terra Estates. All Rights Reserved. | Made by <a href="https://ndris-dubova.netlify.app/" className="hover:text-white">Ndris Dubova</a>
          </div>
        </div>
      </footer>
      <Chatbot />
    </>
  );
}
