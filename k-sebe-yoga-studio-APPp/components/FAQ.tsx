import { Plus } from 'lucide-react';
import React, { useState } from 'react';
import { FadeIn } from './FadeIn';

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
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
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
};

const faqData = [
  {
    question: 'С чего начать, если я никогда не занималась?',
    answer: 'Приходите на любое групповое занятие! Все практики адаптированы для начинающих. Преподаватель поможет с техникой и предложит упрощённые варианты асан.',
  },
  {
    question: 'Нужна ли специальная подготовка?',
    answer: 'Нет, специальная подготовка не требуется. Достаточно желания и удобной одежды. Мы работаем с любым уровнем физической формы.',
  },
  {
    question: 'Что обязательно нужно взять с собой?',
    answer: 'Возьмите удобную одежду, в которой комфортно двигаться. Коврики есть в студии. Рекомендуем не есть плотно за 2 часа до практики.',
  },
  {
    question: 'Сколько времени длятся занятия?',
    answer: 'Групповые занятия длятся 1 час. Индивидуальные тренировки — по договорённости, обычно от 60 до 90 минут.',
  },
];

export const FAQ: React.FC = () => {
  return (
    <section className="py-24 px-6 max-w-3xl mx-auto scroll-mt-20">
      <FadeIn>
        <h2 className="text-4xl md:text-6xl font-serif text-brand-text/90 mb-12 text-center">
          Частые вопросы
        </h2>
      </FadeIn>
      <div className="space-y-2">
        {faqData.map((item, idx) => (
          <FadeIn key={idx} delay={(idx + 1) * 100} direction="up">
            <FAQItem question={item.question} answer={item.answer} />
          </FadeIn>
        ))}
      </div>
    </section>
  );
};
