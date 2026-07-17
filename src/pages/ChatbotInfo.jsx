import { Link } from 'react-router-dom';
import { MessageCircle, Search, Mail, ShieldAlert } from 'lucide-react';
import Chatbot from '../components/Chatbot';
import Seo from '../components/Seo';

export default function ChatbotInfo() {
  return (
    <div className="bg-[#f7f7f7] min-h-screen">
      <Seo
        title="Concierge Assistant"
        description="Meet the Terra Estates virtual concierge — get instant help finding properties, answers about buying and financing, and book a viewing any time."
      />
      <section className="pt-28 md:pt-36 pb-10 md:pb-16 px-4 md:px-6 text-center">
        <h1 className="font-display text-3xl sm:text-5xl">About the Terra Concierge</h1>
        <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
          What our chatbot can do & how it works, and its limitations.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-4 md:px-6 pb-20 space-y-6">
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-full bg-soft-gold/10 flex items-center justify-center flex-shrink-0">
              <Search className="w-5 h-5 text-soft-gold" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold mb-2">Finding properties</h2>
              <p className="text-gray-600 leading-relaxed">
                Tap "Find Properties" and describe what you're looking for &mdash; a city, property type, budget
                (e.g. "under $5M"), number of bedrooms, or a feature like "pool" or "beach". You can also ask
                for the "cheapest" or "most expensive" match, and refine results with follow-ups like
                "cheaper" or "more bedrooms". The chatbot searches our current listings directly &mdash;
                it isn't guessing or inventing properties.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-full bg-soft-gold/10 flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-soft-gold" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold mb-2">Contact & inquiries</h2>
              <p className="text-gray-600 leading-relaxed">
                The "Contact" and "Inquiries" buttons let you send a message straight to our team &mdash;
                anything you type is forwarded by email, the same as filling out our contact form.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-full bg-soft-gold/10 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-soft-gold" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold mb-2">How it works?</h2>
              <p className="text-gray-600 leading-relaxed">
                The concierge is a rule-based assistant built into the site &mdash; it matches keywords in your
                message against our listings and routes contact requests to our team. It isn't a general-purpose
                AI, so it works best with short, specific phrases rather than open-ended conversation.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 border-l-4 border-soft-gold">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold mb-2">Please double-check important details</h2>
              <p className="text-gray-600 leading-relaxed">
                Prices, availability, and features can change. Always confirm important details &mdash; price,
                availability, exact specifications &mdash; with one of our agents via the{' '}
                <Link to="/contact" className="text-soft-gold font-semibold hover:text-dark-gold underline">Contact page</Link>{' '}
                before making a decision.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Chatbot />
    </div>
  );
}
