
import React from 'react';
import { FadeIn } from './FadeIn';
import { Image } from './Image';
import { ArrowRight } from 'lucide-react';

interface DirectionsProps {
  onBook: (type: string) => void;
}

export const Directions: React.FC<DirectionsProps> = ({ onBook }) => {
  return (
    <section id="directions" className="px-4 pb-24 scroll-mt-20">
      <div className="max-w-7xl mx-auto space-y-6">
          <FadeIn delay={100} direction="up">
            <div className="group bg-[#EBF7F1] rounded-[3rem] p-8 md:p-16 transition-all hover:shadow-2xl hover:shadow-brand-green/10">
            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-20">
                <div className="md:w-1/2 order-2 md:order-1">
                <h3 className="text-3xl md:text-5xl font-serif text-brand-text mb-6">Inside Flow</h3>
                <p className="text-brand-text/70 text-lg leading-relaxed mb-8">Практика, вобравшая в себя лучшее из йоги, танца и музыки. Асаны сменяют друг друга, превращаясь в плавные, ритмичные движения.<span className="block mt-4 font-medium text-brand-green">Это танец твоего дыхания.</span></p>
                <div className="flex flex-wrap gap-3 mb-8">
                    {["Ритм", "Музыка", "Поток"].map(tag => (<span key={tag} className="px-5 py-2 bg-white rounded-full text-xs text-brand-green font-bold tracking-wider uppercase border border-white group-hover:border-brand-green transition-colors">{tag}</span>))}
                </div>
                <button onClick={() => onBook("Inside Flow")} className="flex items-center gap-2 text-brand-green font-medium group/btn w-fit"><span>Записаться</span><ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" /></button>
                </div>
                <div className="md:w-1/2 w-full aspect-square md:aspect-[4/3] rounded-[2.5rem] overflow-hidden order-1 md:order-2 shadow-lg rotate-2 group-hover:rotate-0 transition-transform duration-700">
                <Image src="https://images.unsplash.com/photo-1552196563-55cd4e45efb3?q=80&w=800&auto=format&fit=crop" alt="Inside Flow - Warrior Pose" storageKey="direction-inside-flow" containerClassName="w-full h-full" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                </div>
            </div>
            </div>
          </FadeIn>
          <FadeIn delay={200} direction="up">
            <div className="group bg-[#f5f5f4] rounded-[3rem] p-8 md:p-16 transition-all hover:shadow-2xl hover:shadow-stone-200">
            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-20">
                <div className="md:w-1/2 w-full aspect-square md:aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-lg -rotate-2 group-hover:rotate-0 transition-transform duration-700">
                <Image src="https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop" alt="Hatha Yoga" storageKey="direction-hatha" containerClassName="w-full h-full" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                </div>
                <div className="md:w-1/2">
                <h3 className="text-3xl md:text-5xl font-serif text-brand-text mb-6">Хатха йога</h3>
                <p className="text-brand-text/70 text-lg leading-relaxed mb-8">Классическая форма йоги для работы с телом и умом. Включает дыхательные упражнения, асаны и очищающие практики.<span className="block mt-4 font-medium text-stone-600">Основа силы и баланса.</span></p>
                <div className="flex flex-wrap gap-3 mb-8">
                    {["Сила", "Баланс", "Дыхание"].map(tag => (<span key={tag} className="px-5 py-2 bg-white rounded-full text-xs text-stone-500 font-bold tracking-wider uppercase border border-white group-hover:border-stone-400 transition-colors">{tag}</span>))}
                </div>
                 <button onClick={() => onBook("Хатха Йога")} className="flex items-center gap-2 text-stone-600 font-medium group/btn w-fit"><span>Записаться</span><ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" /></button>
                </div>
            </div>
            </div>
          </FadeIn>
      </div>
    </section>
  );
};
