import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import { addMessage } from '../utils/storage';
import NewsletterForm from '../components/NewsletterForm';
import Chatbot from '../components/Chatbot';

const contactCards = [
  { icon: '', title: 'Office', info: '25 Beverly Hills Avenue\nLos Angeles, California' },
  { icon: '', title: 'Phone', info: '+1 (310) 555-0147' },
  { icon: '', title: 'Email', info: 'contact@elysian.com' },
  { icon: '', title: 'Hours', info: 'Mon - Fri : 9AM - 7PM' },
];

export default function Contact() {
  const formRef = useRef(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      const fd = new FormData(formRef.current);
      await addMessage({
        firstName: fd.get('first_name') || '',
        lastName: fd.get('last_name') || '',
        email: fd.get('email') || '',
        subject: fd.get('subject') || '',
        message: fd.get('message') || '',
      });
      await emailjs.sendForm(
        'service_gkwnn4k',
        'template_j7abcbp',
        formRef.current,
        'yXRguh-oDkNVwjAWI'
      );
      setSuccess(true);
      formRef.current.reset();
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Hero */}
      <section
        className="pt-36 pb-24 px-6 bg-cover bg-center relative"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1974&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative max-w-5xl mx-auto text-center text-white">
          <p className="uppercase tracking-[0.4em] text-sm text-[#d4b17a]">Luxury Real Estate</p>
          <h2 className="font-display text-5xl md:text-7xl mt-6 leading-tight">
            Let's Find Your Dream Property.
          </h2>
          <p className="mt-6 text-gray-200 max-w-2xl mx-auto text-lg">
            Connect with the Elysian team and discover exceptional luxury homes, elite agents, and premium real estate experiences.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <p className="uppercase tracking-[0.3em] text-[#C0A067] font-semibold text-sm">Contact Elysian</p>
            <h3 className="font-display text-5xl mt-4 leading-tight">We'd Love To Hear From You.</h3>
            <p className="mt-6 text-gray-600 leading-relaxed">
              Whether you're searching for your next luxury residence, investment property, or private consultation,
              our elite team is ready to assist you every step of the way.
            </p>
            <div className="grid sm:grid-cols-2 gap-6 mt-10">
              {contactCards.map(card => (
                <div key={card.title} className="contact-card bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                  <div className="text-3xl mb-3">{card.icon}</div>
                  <h4 className="font-semibold text-lg">{card.title}</h4>
                  <p className="text-gray-500 mt-2 text-sm whitespace-pre-line">{card.info}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="glass rounded-[2rem] shadow-2xl p-8 md:p-12 border border-white/50">
            <h4 className="font-display text-4xl mb-8">Send a Message</h4>
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <input type="text" name="first_name" placeholder="First Name" className="input-style" required />
                <input type="text" name="last_name" placeholder="Last Name" className="input-style" required />
              </div>
              <input type="email" name="email" placeholder="Email Address" className="input-style" required />
              <input type="text" name="subject" placeholder="Subject" className="input-style" />
              <textarea rows={6} name="message" placeholder="Your Message" className="input-style resize-none" />
              <button
                type="submit"
                disabled={sending}
                className="w-full bg-black text-white py-4 rounded-xl font-semibold hover:bg-[#C0A067] hover:text-black transition duration-300 text-lg disabled:opacity-60"
              >
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </form>
            {success && (
              <div className="mt-6 bg-green-100 text-green-700 px-5 py-4 rounded-xl font-medium">
                Your message has been sent successfully.
              </div>
            )}
            {error && (
              <div className="mt-6 bg-red-100 text-red-700 px-5 py-4 rounded-xl font-medium">{error}</div>
            )}
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto rounded-[2rem] overflow-hidden shadow-2xl">
          <iframe
            className="w-full h-[500px]"
            src="https://maps.google.com/maps?q=beverly%20hills&t=&z=13&ie=UTF8&iwloc=&output=embed"
            loading="lazy"
            title="Office Location"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#141414] text-white pt-20 pb-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <h3 className="font-display text-3xl font-bold mb-4">Elysian</h3>
              <p className="text-gray-400 text-sm">Elevating luxury real estate experiences worldwide.</p>
              <h4 className="mt-8 mb-3 font-semibold">Join Our Newsletter</h4>
              <NewsletterForm />
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-3 text-gray-400">
                {[['/', 'Home'], ['/properties', 'Properties'], ['/agents', 'Our Agents'], ['/about', 'About'], ['/contact', 'Contact']].map(([path, label]) => (
                  <li key={path}><Link className="hover:text-white" to={path}>{label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-6">Contact</h4>
              <div className="space-y-4 text-gray-400 text-sm">
                <p>Los Angeles, California</p>
                <p>+1 (310) 555-0147</p>
                <p>contact@Elysian.com</p>
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
            © {new Date().getFullYear()} Elysian Estates. All Rights Reserved. | Made by <a href="https://ndris-dubova.netlify.app/" className="hover:text-white">Ndris Dubova</a>
          </div>
        </div>
      </footer>
      <Chatbot />
    </>
  );
}
