import { Link } from 'react-router-dom';
import NewsletterForm from '../components/NewsletterForm';
import Chatbot from '../components/Chatbot';
import Seo from '../components/Seo';

const milestones = [
  { year: '2005 - Foundation', desc: 'Terra Estates was born with a vision for luxury real estate excellence.' },
  { year: '2010 - Global Expansion', desc: 'We expanded into international luxury markets.' },
  { year: '2018 - Elite Network', desc: 'Built a global network of elite property partners.' },
  { year: '2026 - Modern Luxury Era', desc: 'Redefining luxury real estate with innovation and design.' },
];

const stats = [
  { value: '12B', label: 'Portfolio Value' },
  { value: '20+', label: 'Years Experience' },
  { value: '1%', label: 'Top Agents' },
  { value: '98%', label: 'Client Satisfaction' },
];

export default function About() {
  return (
    <>
      <Seo
        title="About Us"
        description="Terra Estates is a luxury real-estate agency delivering a full-service concierge experience — from private viewings to bespoke marketing and expert negotiation."
      />
      {/* Hero */}
      <section className="pt-28 text-center px-6">
        <h2 className="font-display text-5xl md:text-6xl">A Legacy of Luxury.</h2>
        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
          We craft extraordinary real estate experiences, redefining modern luxury living.
        </p>
      </section>

      {/* The Standard */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 items-center">
        <img className="rounded-xl shadow-lg" src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=70" alt="Luxury interior" loading="lazy" decoding="async" />
        <div>
          <h3 className="font-display text-3xl">The Terra Standard.</h3>
          <p className="mt-4 text-gray-600">Our commitment to excellence defines every property we represent.</p>
          <div className="grid grid-cols-2 gap-6 mt-6">
            {stats.map(s => (
              <div key={s.label}>
                <p className="text-3xl font-bold">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey */}
      <section className="bg-[#0f0f0f] py-24 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <p className="uppercase tracking-[0.4em] text-[#C0A067] text-sm text-center mb-4">Our History</p>
          <h3 className="font-display text-4xl md:text-5xl text-white text-center mb-20">Our Journey to Excellence</h3>

          <div className="relative">
            {/* Center vertical line */}
            <div className="absolute left-6 md:left-1/2 -translate-x-px top-0 bottom-0 w-px bg-gradient-to-b from-[#C0A067]/0 via-[#C0A067]/60 to-[#C0A067]/0" />

            <div className="space-y-12 md:space-y-0">
              {milestones.map((m, i) => {
                const isLeft = i % 2 === 0;
                const [year, title] = m.year.split(' - ');
                return (
                  <div key={m.year} className="relative md:grid md:grid-cols-2 md:gap-10 md:items-center md:mb-16">
                    {/* Left card */}
                    <div className={`pl-14 md:pl-0 ${isLeft ? 'md:text-right' : 'md:order-last'}`}>
                      <div className={`bg-white/5 border border-white/10 rounded-2xl p-7 hover:border-[#C0A067]/40 hover:bg-white/8 transition-all duration-300 group
                        ${isLeft ? '' : 'md:ml-0'}`}>
                        <span className="inline-block font-display text-4xl font-bold text-[#C0A067]/30 group-hover:text-[#C0A067]/50 transition-colors duration-300 mb-3 leading-none">
                          {year}
                        </span>
                        <h4 className="text-white font-semibold text-xl mb-2">{title}</h4>
                        <p className="text-gray-400 leading-relaxed">{m.desc}</p>
                      </div>
                    </div>

                    {/* Center dot */}
                    <div className="absolute left-6 md:left-1/2 top-8 md:top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10">
                      <div className="w-4 h-4 rounded-full bg-[#C0A067] ring-4 ring-[#C0A067]/20 ring-offset-4 ring-offset-[#0f0f0f]" />
                    </div>

                    {/* Empty right column for alternating */}
                    <div className={`hidden md:block ${isLeft ? '' : 'md:order-first'}`} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Founders */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <h3 className="font-display text-4xl text-center">Meet The Founders</h3>
        <div className="grid md:grid-cols-2 gap-10 mt-12">
          {[
            { name: 'Michael Chen', role: 'Co-Founder & CEO', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=70' },
            { name: 'Isabella Rossi', role: 'Co-Founder & Director', img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=70' },
          ].map(f => (
            <div key={f.name} className="bg-white p-6 rounded-xl shadow">
              <img className="rounded-lg mb-4 w-full object-cover h-64" src={f.img} alt={f.name} loading="lazy" decoding="async" />
              <h4 className="font-bold">{f.name}</h4>
              <p className="text-gray-600">{f.role}</p>
            </div>
          ))}
        </div>
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
