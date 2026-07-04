import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css/pagination';
import { MapPin, Bed, Bath, Ruler, Key, Globe, Quote, ChevronUp } from 'lucide-react';
import Footer from '../components/Footer';
import Chatbot from '../components/Chatbot';

const IMAGES = {
  hero: 'https://raw.githubusercontent.com/farazc60/Project-Images/refs/heads/main/Elysian%20Real%20Estate%20Template/7.png',
  p1: 'https://raw.githubusercontent.com/farazc60/Project-Images/refs/heads/main/Elysian%20Real%20Estate%20Template/1.png',
  p2: 'https://raw.githubusercontent.com/farazc60/Project-Images/refs/heads/main/Elysian%20Real%20Estate%20Template/2.png',
  p3: 'https://raw.githubusercontent.com/farazc60/Project-Images/refs/heads/main/Elysian%20Real%20Estate%20Template/3.png',
  service1: 'https://raw.githubusercontent.com/farazc60/Project-Images/refs/heads/main/Elysian%20Real%20Estate%20Template/5.png',
  service2: 'https://raw.githubusercontent.com/farazc60/Project-Images/refs/heads/main/Elysian%20Real%20Estate%20Template/9.png',
  a1: 'https://raw.githubusercontent.com/farazc60/Project-Images/refs/heads/main/Elysian%20Real%20Estate%20Template/Kenji%20Tanaka.png',
  a2: 'https://raw.githubusercontent.com/farazc60/Project-Images/refs/heads/main/Elysian%20Real%20Estate%20Template/Isabella%20Rossi.png',
  a3: 'https://raw.githubusercontent.com/farazc60/Project-Images/refs/heads/main/Elysian%20Real%20Estate%20Template/Marcus%20Cole.png',
  t1: 'https://raw.githubusercontent.com/farazc60/Project-Images/refs/heads/main/Elysian%20Real%20Estate%20Template/Sarah%20Jenkins.png',
  t2: 'https://raw.githubusercontent.com/farazc60/Project-Images/refs/heads/main/Elysian%20Real%20Estate%20Template/David%20Lee.png',
  t3: 'https://raw.githubusercontent.com/farazc60/Project-Images/refs/heads/main/Elysian%20Real%20Estate%20Template/Emily%20Rodriguez.png',
};

const STATS = [
  { id: 'stat-1', target: 12, suffix: 'B+', label: 'In Portfolio Value', sub: 'Representing the finest properties on the market.' },
  { id: 'stat-2', target: 25, suffix: '', label: 'Years of Expertise', sub: 'A legacy of excellence in luxury real estate.' },
  { id: 'stat-3', target: 98, suffix: '%', label: 'Client Satisfaction', sub: 'Building lasting relationships based on trust.' },
];

function useCountUp(target, duration = 2000, shouldStart = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!shouldStart) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [shouldStart, target, duration]);
  return count;
}

function StatItem({ stat, shouldStart }) {
  const count = useCountUp(stat.target, 2000, shouldStart);
  return (
    <div data-aos="fade-up" data-aos-delay={stat.id === 'stat-1' ? 100 : stat.id === 'stat-2' ? 200 : 300}>
      <span className="font-display text-6xl font-bold text-soft-gold">{count}</span>
      {stat.suffix && <span className="font-display text-6xl font-bold text-soft-gold">{stat.suffix}</span>}
      <h3 className="text-xl font-semibold text-ivory/80 mt-4">{stat.label}</h3>
      <p className="text-ivory/60">{stat.sub}</p>
    </div>
  );
}

export default function Home() {
  const [statsStarted, setStatsStarted] = useState(false);
  const statsRef = useRef(null);
  const progressRingRef = useRef(null);
  const scrollBtnRef = useRef(null);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true, offset: 50 });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) { setStatsStarted(true); observer.disconnect(); } },
      { threshold: 0.5 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const ring = progressRingRef.current;
    const btn = scrollBtnRef.current;
    if (!ring || !btn) return;
    const circumference = 2 * Math.PI * 16;
    ring.style.strokeDasharray = `${circumference} ${circumference}`;

    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const pct = docHeight > 0 ? scrollTop / docHeight : 0;
      ring.style.strokeDashoffset = circumference - pct * circumference;
      if (scrollTop > 300) btn.classList.add('is-visible');
      else btn.classList.remove('is-visible');
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const el = document.getElementById('scroll-indicator');
      if (el && scrollHeight > clientHeight) {
        el.style.width = `${(scrollTop / (scrollHeight - clientHeight)) * 100}%`;
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div id="scroll-indicator" style={{ width: '0%' }} />

      {/* Hero */}
      <section className="min-h-screen lg:min-h-[90vh] flex items-end relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={IMAGES.hero} alt="Luxurious modern home exterior" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/60 to-transparent" />
        </div>
        <div className="container mx-auto px-6 pb-20 md:pb-32 lg:pb-40 relative z-10 text-left">
          <div data-aos="fade-up">
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-ivory leading-tight mb-6">
              Define Your Legacy
            </h1>
            <p className="text-lg md:text-xl text-ivory/80 max-w-2xl mb-10">
              Discover an exclusive collection of the world's most prestigious properties.
              We don't just sell homes; we curate lifestyles.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/properties" className="bg-soft-gold text-charcoal px-8 py-4 rounded-md text-lg font-semibold hover:bg-dark-gold shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 text-center">
                Explore Listings
              </Link>
              <Link to="/about" className="bg-transparent text-ivory border border-ivory/50 px-8 py-4 rounded-md text-lg font-semibold hover:bg-ivory hover:text-charcoal transition-all duration-300 text-center">
                About Elysian
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-ivory">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16" data-aos="fade-up">
            <span className="text-soft-gold font-semibold tracking-widest uppercase">Our Portfolio</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-charcoal mt-4">Featured Properties</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { img: IMAGES.p1, title: 'La Jolla Modern', loc: 'San Diego, California', price: '$12,500,000', beds: 5, baths: 7, sqft: '6,200 sf' },
              { img: IMAGES.p2, title: 'Aspen Ridge', loc: 'Aspen, Colorado', price: '$22,000,000', beds: 6, baths: 8, sqft: '8,100 sf' },
              { img: IMAGES.p3, title: 'Park Ave Penthouse', loc: 'New York, New York', price: '$35,000,000', beds: 4, baths: 5, sqft: '5,000 sf' },
            ].map((p, i) => (
              <div key={i} className="rounded-lg overflow-hidden shadow-xl transform transition-all duration-500 hover:scale-[1.02] group" data-aos="fade-up" data-aos-delay={(i + 1) * 100}>
                <div className="relative h-96">
                  <img src={p.img} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute bottom-4 left-4 right-4 p-5 bg-black/30 backdrop-blur-lg rounded-lg border border-white/20">
                    <h3 className="font-display text-2xl font-bold text-white mb-1">{p.title}</h3>
                    <div className="flex items-center text-soft-gold text-sm"><MapPin className="w-4 h-4 mr-2" /><span>{p.loc}</span></div>
                  </div>
                  <span className="absolute top-4 left-4 bg-soft-gold text-charcoal text-xs font-bold uppercase px-3 py-1 rounded-full">For Sale</span>
                </div>
                <div className="bg-white p-6">
                  <div className="mb-4"><span className="font-display text-3xl font-bold text-charcoal">{p.price}</span></div>
                  <div className="flex justify-start space-x-6 text-charcoal/70 mb-5">
                    <span className="flex items-center"><Bed className="w-5 h-5 mr-2 text-soft-gold" /> {p.beds} bed</span>
                    <span className="flex items-center"><Bath className="w-5 h-5 mr-2 text-soft-gold" /> {p.baths} bath</span>
                    <span className="flex items-center"><Ruler className="w-5 h-5 mr-2 text-soft-gold" /> {p.sqft}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-16" data-aos="fade-up">
            <Link to="/properties" className="bg-charcoal text-ivory px-10 py-4 rounded-md text-lg font-semibold hover:bg-soft-gold hover:text-charcoal shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
              View All Properties
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-light-gray">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div data-aos="fade-right">
              <span className="text-soft-gold font-semibold tracking-widest uppercase">Bespoke Service</span>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-charcoal mt-4 mb-8">A Higher Standard of Real Estate</h2>
              <p className="text-lg text-charcoal/70 mb-8">
                Our clients receive more than just representation; they receive a full-service concierge experience.
                From private viewings to bespoke marketing strategies and expert negotiation, we manage every detail with precision and care.
              </p>
              <div className="space-y-6 mb-10">
                {[
                  { Icon: Key, title: 'Exclusive Access', desc: 'Unlock off-market properties and private listings not available to the public.' },
                  { Icon: Globe, title: 'Global Network', desc: 'Leverage our connections with elite agents and buyers around the world.' },
                ].map(({ Icon, title, desc }) => (
                  <div key={title} className="flex items-start">
                    <div className="flex-shrink-0 w-12 h-12 bg-soft-gold/10 text-soft-gold rounded-full flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-semibold text-charcoal">{title}</h3>
                      <p className="text-charcoal/70 mt-1">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative h-[500px] lg:h-[600px]" data-aos="fade-left">
              <img src={IMAGES.service1} alt="Luxury interior" className="w-3/4 h-3/4 object-cover rounded-lg shadow-2xl" />
              <img src={IMAGES.service2} alt="Architectural detail" className="absolute bottom-0 right-0 w-1/2 h-1/2 object-cover rounded-lg shadow-2xl border-8 border-light-gray" data-aos="zoom-in" data-aos-delay="300" />
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-20 bg-charcoal text-ivory" ref={statsRef}>
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {STATS.map(stat => <StatItem key={stat.id} stat={stat} shouldStart={statsStarted} />)}
          </div>
        </div>
      </section>

      {/* Agents */}
      <section className="py-20 bg-ivory">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16" data-aos="fade-up">
            <span className="text-soft-gold font-semibold tracking-widest uppercase">The Curators</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-charcoal mt-4">Meet Our Agents</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {[
              { img: IMAGES.a1, name: 'Alexander Cole', role: 'Founder & Principal Agent', desc: 'With two decades of experience, Alexander is a master of the luxury market.', email: 'alexander@elysian.com' },
              { img: IMAGES.a2, name: 'Isabella Chen', role: 'Senior Partner', desc: "Isabella's global perspective connects discerning clients with their dream homes.", email: 'isabella@elysian.com' },
              { img: IMAGES.a3, name: 'Marcus Thorne', role: 'Estates Director', desc: 'Marcus specializes in architectural masterpieces and historic estates.', email: 'marcus@elysian.com' },
            ].map((agent, i) => (
              <div key={i} className="text-center group" data-aos="fade-up" data-aos-delay={(i + 1) * 100}>
                <div className="relative inline-block mb-6">
                  <img src={agent.img} alt={agent.name} className="w-64 h-64 object-cover rounded-full object-top" />
                  <div className="absolute inset-0 rounded-full border-2 border-soft-gold/50 scale-105 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:border-soft-gold" />
                </div>
                <h3 className="font-display text-2xl font-bold text-charcoal">{agent.name}</h3>
                <p className="text-soft-gold font-medium mb-3">{agent.role}</p>
                <p className="text-charcoal/70 max-w-xs mx-auto mb-4">{agent.desc}</p>
                <a href={`mailto:${agent.email}`} className="font-semibold text-charcoal hover:text-soft-gold transition-colors">{agent.email}</a>
              </div>
            ))}
          </div>
          <div className="text-center mt-16" data-aos="fade-up">
            <Link to="/agents" className="bg-charcoal text-ivory px-10 py-4 rounded-md text-lg font-semibold hover:bg-soft-gold hover:text-charcoal shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
              Meet The Full Team
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-light-gray overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16" data-aos="fade-up">
            <span className="text-soft-gold font-semibold tracking-widest uppercase">Our Clients</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-charcoal mt-4">From Those We've Served</h2>
          </div>
          <div data-aos="fade-up">
            <Swiper
              className="testimonial-slider"
              modules={[Autoplay, Pagination]}
              loop
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              breakpoints={{ 768: { slidesPerView: 2, spaceBetween: 30 } }}
              spaceBetween={30}
              slidesPerView={1}
            >
              {[
                { quote: '"Working with Elysian was a revelation. Their attention to detail and market knowledge is simply unmatched."', name: 'Sarah & Tom Lawson', role: 'Buyers, Aspen Estate', img: IMAGES.t1 },
                { quote: '"The marketing for our penthouse was breathtaking. Alexander and his team secured a record price. Truly exceptional."', name: 'David Chen', role: 'Seller, Park Ave Penthouse', img: IMAGES.t2 },
                { quote: '"As an international buyer, I needed a team I could trust. Elysian handled everything flawlessly."', name: 'Elena Rodriguez', role: 'Buyer, Miami Waterfront', img: IMAGES.t3 },
              ].map((t, i) => (
                <SwiperSlide key={i}>
                  <div className="flex flex-col md:flex-row items-start">
                    <Quote className="w-8 h-8 text-soft-gold/30 -ml-1 flex-shrink-0" fill="#C0A067" />
                    <div className="md:ml-4">
                      <p className="font-display text-2xl lg:text-3xl text-charcoal italic mb-6">{t.quote}</p>
                      <div className="flex items-center">
                        <img src={t.img} alt={t.name} className="w-14 h-14 rounded-full object-cover" />
                        <div className="ml-4">
                          <h4 className="text-xl font-semibold text-charcoal">{t.name}</h4>
                          <p className="text-charcoal/70">{t.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-ivory">
        <div className="container mx-auto px-6">
          <div className="bg-charcoal text-ivory rounded-lg shadow-2xl p-6 sm:p-10 md:p-20 text-center" data-aos="fade-up">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-6">Begin Your Legacy</h2>
            <p className="text-base sm:text-lg text-ivory/80 max-w-2xl mx-auto mb-10">
              Whether you are looking to acquire the exceptional or sell the extraordinary, our team is ready to guide you.
            </p>
            <Link to="/contact" className="inline-block w-full sm:w-auto bg-soft-gold text-charcoal px-6 sm:px-10 py-3 sm:py-4 rounded-md text-base sm:text-lg font-semibold hover:bg-dark-gold shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
              Schedule a Consultation
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      {/* Scroll to Top */}
      <button id="scrollTopBtn" ref={scrollBtnRef} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Scroll to top" className="cursor-pointer border-none bg-transparent p-0">
        <svg className="w-full h-full" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
          <circle className="stroke-charcoal/10" cx="18" cy="18" r="16" strokeWidth="2" fill="none" />
          <circle ref={progressRingRef} id="progress-ring" className="stroke-soft-gold" cx="18" cy="18" r="16" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="100.53" strokeDashoffset="100.53" />
        </svg>
        <span className="absolute text-charcoal"><ChevronUp className="w-6 h-6" /></span>
      </button>

      <Chatbot />
    </>
  );
}
