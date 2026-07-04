import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { addSubscriber } from '../utils/storage';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email.trim()) {
      await addSubscriber(email.trim());
      setDone(true);
    }
  };

  if (done) {
    return (
      <div className="animate-fade-up flex items-center gap-3 py-1">
        <div className="relative flex-shrink-0">
      
          <span className="absolute inset-0 rounded-full bg-[#C0A067]/40 animate-ring" />
          <div className="relative w-9 h-9 bg-[#C0A067] rounded-full flex items-center justify-center animate-check-pop">
            <Check className="w-4 h-4 text-black" strokeWidth={3} />
          </div>
        </div>
        <div>
          <p className="text-white text-sm font-semibold leading-tight">You're subscribed!</p>
          <p className="text-gray-400 text-xs mt-0.5">Thank you for joining Elysian.</p>
        </div>
      </div>
    );
  }

  return (
    <form className="flex" onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Your Email"
        required
        className="w-full bg-white/10 text-white px-4 py-2.5 rounded-l-md outline-none placeholder:text-gray-500 focus:bg-white/15 transition"
      />
      <button
        type="submit"
        className="bg-[#C0A067] text-black px-4 rounded-r-md hover:bg-[#a98952] transition flex items-center flex-shrink-0"
      >
        <ArrowRight className="w-5 h-5" />
      </button>
    </form>
  );
}
