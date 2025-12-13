
import React, { useRef, useEffect } from 'react';
import { FadeIn } from './FadeIn';
import { Image } from './Image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TestimonialProps {
  id: number;
  name: string;
  text: string;
  image: string;
}

const testimonials = [
  {
    id: 1,
    name: "Екатерина",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    text: "Самый чуткий, добрый, открытый тренер! Я не встречала ни одного человека, который так любит и горит своей работой! Полная отдача! 🥰"
  },
  {
    id: 2,
    name: "Анна",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop",
    text: "Я с Катей уже больше года, и за это время я стала намного пластичнее и выносливее. Каждое занятие – это плюс 100500 к уверенности в себе."
  },
  {
    id: 3,
    name: "Дарья",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    text: "Если вы, как и я, никогда не занимались йогой, то лучшего тренера не найти! Катя заражает интересом в Inside Flow с первых секунд."
  },
  {
    id: 4,
    name: "Марина",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
    text: "Для меня это не просто спорт, это психотерапия. После занятий выходишь обновленной, спокойной и наполненной энергией."
  },
  {
    id: 5,
    name: "Ольга",
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&h=200&fit=crop",
    text: "Студия очень атмосферная. Приятно просто находиться здесь. А практики с Катей — это всегда глубокое погружение."
  }
];

const TestimonialCard: React.FC<TestimonialProps> = ({ id, name, text, image }) => (
  <div className="relative mt-12 mb-8 mx-4 flex-shrink-0 w-80 md:w-96 snap-center group">
    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-brand-green/10 h-full flex flex-col justify-between group-hover:shadow-xl group-hover:border-brand-green/30 transition-all duration-500">
      <p className="text-brand-text/80 text-sm md:text-base leading-relaxed mb-6 font-light italic">
        "{text}"
      </p>
      <div className="flex items-center justify-end gap-3">
         <div className="h-[1px] w-8 bg-brand-green/30"></div>
         <h4 className="text-brand-green font-medium text-lg font-serif">{name}</h4>
      </div>
    </div>
    <div className="absolute -top-6 right-8 w-16 h-16 rounded-full border-4 border-stone-50 overflow-hidden shadow-lg group-hover:scale-110 transition-transform duration-500 bg-stone-200">
      <Image 
        src={image} 
        alt={name} 
        storageKey={`review-avatar-${id}`}
        containerClassName="w-full h-full"
        className="w-full h-full object-cover" 
        controlsClassName="-top-2 -right-2 scale-75 origin-top-right"
      />
    </div>
  </div>
);

export const Reviews: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isHoveredRef = useRef(false);

  const startAutoScroll = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
        if (!scrollRef.current || isHoveredRef.current) return;
        
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        // If reached end, wrap smoothly to start (logic simplified: scroll back to 0)
        // Or infinite scroll logic: append children. For simplicity, just reset or bounce.
        if (scrollLeft + clientWidth >= scrollWidth - 50) {
             scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
             scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
    }, 4000);
  };

  useEffect(() => {
    startAutoScroll();
    return () => {
        if(intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 350;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleMouseEnter = () => { isHoveredRef.current = true; };
  const handleMouseLeave = () => { isHoveredRef.current = false; };

  return (
    <section id="reviews" className="py-24 bg-stone-50 overflow-hidden scroll-mt-20 relative group/section">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <FadeIn>
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
                <div className="text-center md:text-left">
                    <h4 className="text-brand-green tracking-[0.2em] text-xs font-bold uppercase mb-4">Доверие</h4>
                    <h2 className="text-4xl md:text-6xl font-serif text-brand-text/90">Отзывы учеников</h2>
                </div>
                
                {/* Navigation Buttons */}
                <div className="hidden md:flex gap-2">
                    <button 
                        onClick={() => scroll('left')} 
                        className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center hover:bg-white hover:shadow-md transition-all active:scale-95"
                    >
                        <ChevronLeft className="w-5 h-5 text-stone-600" />
                    </button>
                    <button 
                        onClick={() => scroll('right')}
                        className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center hover:bg-white hover:shadow-md transition-all active:scale-95"
                    >
                        <ChevronRight className="w-5 h-5 text-stone-600" />
                    </button>
                </div>
            </div>
        </FadeIn>
        
        <FadeIn delay={200} direction="up">
            <div 
                ref={scrollRef}
                className="flex overflow-x-auto pb-12 -mx-6 px-6 scrollbar-hide snap-x snap-mandatory md:gap-2"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleMouseEnter}
                onTouchEnd={handleMouseLeave}
            >
                {testimonials.map((t, i) => (
                    <TestimonialCard key={t.id} {...t} />
                ))}
            </div>
        </FadeIn>
      </div>
    </section>
  );
};
