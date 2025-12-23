import { Plus } from 'lucide-react';
import React, { useState } from 'react';
import { FadeIn } from './FadeIn';

interface FAQItemProps {
  question: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-brand-green/10 py-6 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left gap-4 group"
      >
        <span className="text-lg md:text-xl font-light text-brand-text/90 group-hover:text-brand-green transition-colors">
          {question}
        </span>
        <div
          className={`bg-white border border-brand-green/20 rounded-full p-2 text-brand-green transition-all duration-300 ${isOpen ? 'rotate-45 bg-brand-green text-white border-brand-green' : 'group-hover:border-brand-green'}`}
        >
          <Plus className="w-5 h-5" />
        </div>
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <p className="text-brand-text/70 text-sm md:text-base leading-relaxed font-light pl-0 md:w-3/4">
            Для начала занятий вам понадобится только удобная одежда и коврик. Если у вас нет
            коврика, мы предоставим студийный. Рекомендуем не есть плотно за 2 часа до практики,
            чтобы чувствовать легкость.
          </p>
        </div>
      </div>
    </div>
  );
};

export const FAQ: React.FC = () => {
  return (
    <section className="py-24 px-6 max-w-3xl mx-auto scroll-mt-20">
      <FadeIn>
        <h2 className="text-4xl md:text-6xl font-serif text-brand-text/90 mb-12 text-center">
          Частые вопросы
        </h2>
      </FadeIn>
      <div className="space-y-2">
        <FadeIn delay={100} direction="up">
          <FAQItem question="С чего начать, если я никогда не занималась?" />
        </FadeIn>
        <FadeIn delay={200} direction="up">
          <FAQItem question="Нужна ли специальная подготовка?" />
        </FadeIn>
        <FadeIn delay={300} direction="up">
          <FAQItem question="Что обязательно нужно взять с собой?" />
        </FadeIn>
        <FadeIn delay={400} direction="up">
          <FAQItem question="Сколько времени длятся занятия?" />
        </FadeIn>
      </div>
    </section>
  );
};
