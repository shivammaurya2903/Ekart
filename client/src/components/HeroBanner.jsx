import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShieldCheck, Sparkles, Wallet } from 'lucide-react';

const SLIDES = [
  {
    title: 'Big Billion Price Intelligence Sale',
    subtitle: 'Track 6 months of prices and buy only when it makes sense.',
    cta: 'Explore deals',
    category: 'Mobiles',
    gradient: 'from-flipkart-blue to-blue-800',
    icon: Sparkles
  },
  {
    title: 'Guaranteed Lowest Price Badges',
    subtitle: 'Every product card tells you if today is the right day to buy.',
    cta: 'See lowest prices',
    category: 'Laptops',
    gradient: 'from-emerald-600 to-flipkart-green',
    icon: ShieldCheck
  },
  {
    title: 'Zero Hidden Charges',
    subtitle: 'Transparent GST, delivery and discount breakdown before you pay.',
    cta: 'Shop with clarity',
    category: 'All',
    gradient: 'from-flipkart-orange to-red-600',
    icon: Wallet
  }
];

const HeroBanner = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((current) => (current + 1) % SLIDES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const goTo = (direction) => {
    setActive((current) => (current + direction + SLIDES.length) % SLIDES.length);
  };

  const slide = SLIDES[active];
  const Icon = slide.icon;

  return (
    <section className="relative overflow-hidden rounded-sm bg-white shadow-card">
      <div className={`relative flex min-h-44 items-center bg-gradient-to-r ${slide.gradient} px-6 py-8 text-white sm:min-h-52 sm:px-12`}>
        <div className="max-w-2xl">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/80">
            <Icon size={18} />
            EKart Price Intelligence
          </div>
          <h2 className="text-2xl font-bold leading-tight sm:text-4xl">{slide.title}</h2>
          <p className="mt-2 max-w-xl text-sm text-white/90 sm:text-base">{slide.subtitle}</p>
          <button
            type="button"
            onClick={() => navigate(slide.category === 'All' ? '/' : `/?category=${slide.category}`)}
            className="mt-5 rounded-sm bg-white px-5 py-2 text-sm font-bold text-gray-900 shadow-sm transition-transform hover:-translate-y-0.5"
          >
            {slide.cta}
          </button>
        </div>

        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full border-[24px] border-white/10 sm:right-10" />
        <div className="pointer-events-none absolute bottom-0 right-24 h-32 w-32 rounded-full bg-flipkart-plus/20 blur-2xl" />
      </div>

      <button
        type="button"
        onClick={() => goTo(-1)}
        aria-label="Previous banner"
        className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow hover:bg-white"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        type="button"
        onClick={() => goTo(1)}
        aria-label="Next banner"
        className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow hover:bg-white"
      >
        <ChevronRight size={20} />
      </button>

      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
        {SLIDES.map((item, index) => (
          <button
            key={item.title}
            type="button"
            aria-label={`Show banner ${index + 1}`}
            onClick={() => setActive(index)}
            className={`h-2 rounded-full transition-all ${
              index === active ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroBanner;
