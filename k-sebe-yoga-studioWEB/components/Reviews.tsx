import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import React, { useRef } from 'react';
import { FadeIn } from './FadeIn';
import { Image } from './Image';

interface TestimonialProps {
  id: number;
  name: string;
  text: string;
  image: string;
}

const testimonials = [
  {
    id: 1,
    name: 'Екатерина',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    text: 'Самый чуткий, добрый, открытый тренер! Я не встречала ни одного человека, который так любит и горит своей работой! Полная отдача! 🥰',
  },
  {
    id: 2,
    name: 'Анна',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
    text: 'Я с Катей уже больше года, и за это время я стала намного пластичнее и выносливее. Каждое занятие – это плюс 100 к уверенности.',
  },
  {
    id: 3,
    name: 'Дарья',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    text: 'Если вы, как и я, никогда не занимались йогой, то лучшего тренера не найти! Катя заражает интересом в Inside Flow с первых секунд.',
  },
  {
    id: 4,
    name: 'Марина',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
    text: 'Для меня это не просто спорт, это психотерапия. После занятий выходишь обновленной, спокойной и наполненной энергией.',
  },
  {
    id: 5,
    name: 'Ольга',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop',
    text: 'Студия — мое место силы. Прихожу сюда, когда нужно выдохнуть городской ритм и вернуться в тело. Спасибо за эту атмосферу!',
  },
];

const TestimonialCard: React.FC<TestimonialProps> = ({ id, name, text, image }) => (
  <div className="relative mt-12 mb-8 mx-4 flex-shrink-0 w-80 md:w-[28rem] snap-center group">
    <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-brand-green/10 h-full flex flex-col justify-between group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
      {/* Decorative Quote Icon */}
      <Quote className="absolute top-8 left-8 w-10 h-10 text-brand-mint/40 rotate-180" />

      <div className="relative z-10 pt-8">
        <div className="flex gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 text-brand-accent fill-brand-accent" />
          ))}
        </div>
        <p className="text-brand-text/80 text-base md:text-lg leading-relaxed font-light italic">
          "{text}"
        </p>
      </div>

      <div className="flex items-center justify-between mt-8 border-t border-stone-100 pt-6">
        <div>
          <h4 className="text-brand-green font-serif text-xl">{name}</h4>
          <span className="text-xs text-stone-400 uppercase tracking-wider font-bold">
            Ученик студии
          </span>
        </div>
      </div>
    </div>
    <div className="absolute -top-6 right-10 w-20 h-20 rounded-full border-4 border-stone-50 overflow-hidden shadow-lg group-hover:scale-110 transition-transform duration-500 bg-stone-200 z-20">
      <Image
        src={image}
        alt={name}
        storageKey={`review-avatar-${id}`}
        containerClassName="w-full h-full"
        className="w-full h-full object-cover"
      />
    </div>
  </div>
);

export const Reviews: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section id="reviews" className="py-24 bg-stone-50 overflow-hidden scroll-mt-20 relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
          <FadeIn>
            <div>
              <h4 className="text-brand-green tracking-[0.2em] text-xs font-bold uppercase mb-4">
                Доверие
              </h4>
              <h2 className="text-4xl md:text-6xl font-serif text-brand-text/90">
                Отзывы учеников
              </h2>
            </div>
          </FadeIn>

          {/* Navigation Buttons */}
          <div className="hidden md:flex gap-3">
            <button
              onClick={() => scroll('left')}
              className="p-4 rounded-full bg-white border border-stone-200 hover:bg-brand-green hover:text-white hover:border-brand-green transition-all shadow-sm group"
              aria-label="Previous reviews"
            >
              <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-4 rounded-full bg-white border border-stone-200 hover:bg-brand-green hover:text-white hover:border-brand-green transition-all shadow-sm group"
              aria-label="Next reviews"
            >
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <FadeIn delay={200} direction="up">
          <div
            ref={scrollRef}
            className="flex overflow-x-auto pb-16 -mx-6 px-6 scrollbar-hide snap-x snap-mandatory items-stretch"
          >
            {testimonials.map((t, i) => (
              <TestimonialCard key={t.id} {...t} />
            ))}
            <div className="w-12 flex-shrink-0"></div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
