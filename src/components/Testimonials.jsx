import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { Quote } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/pagination';

// Split into its own chunk and rendered only when the testimonials section
// nears the viewport (see DeferredTestimonials in Home.jsx), so Swiper's weight
// stays out of the initial Home render.
export default function Testimonials({ items }) {
  return (
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
      {items.map((t, i) => (
        <SwiperSlide key={i}>
          <div className="flex flex-col md:flex-row items-start">
            <Quote className="w-8 h-8 text-soft-gold/30 -ml-1 flex-shrink-0" fill="#C0A067" />
            <div className="md:ml-4">
              <p className="font-display text-2xl lg:text-3xl text-charcoal italic mb-6">{t.quote}</p>
              <div className="flex items-center">
                <img src={t.img} alt={t.name} loading="lazy" decoding="async" className="w-14 h-14 rounded-full object-cover" />
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
  );
}
