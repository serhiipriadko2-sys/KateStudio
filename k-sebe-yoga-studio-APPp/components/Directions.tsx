import { ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState } from 'react';
import { FadeIn } from './FadeIn';
import { Image } from './Image';

export const Directions: React.FC = () => {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (id: string) => {
    setExpanded((prev) => (prev === id ? null : id));
  };

  return (
    <section id="directions" className="px-4 pb-24 scroll-mt-20">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Inside Flow Card */}
        <FadeIn delay={100} direction="up">
          <div className="group bg-[#EBF7F1] rounded-[3rem] p-8 md:p-16 transition-colors hover:bg-[#E1F2EA]">
            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-20">
              <div className="md:w-1/2 order-2 md:order-1">
                <h3 className="text-3xl md:text-5xl font-serif text-brand-text mb-6">
                  Inside Flow
                </h3>

                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${expanded === 'flow' ? 'max-h-[500px]' : 'max-h-[100px] md:max-h-full'}`}
                >
                  <p className="text-brand-text/70 text-lg leading-relaxed mb-4">
                    Практика, вобравшая в себя лучшее из йоги, танца и музыки. Асаны сменяют друг
                    друга, превращаясь в плавные, ритмичные и красивые движения. Это танец твоего
                    дыхания.
                  </p>
                  <p
                    className={`text-brand-text/70 text-lg leading-relaxed mb-8 ${expanded === 'flow' ? 'block' : 'hidden'}`}
                  >
                    Мы движемся в такт современной музыке, создавая единый поток энергии. Это
                    помогает отключить голову и полностью погрузиться в ощущения тела. Подходит для
                    тех, кто ищет динамику и эстетику в йоге.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex flex-wrap gap-3">
                    <span className="px-4 py-2 bg-white rounded-full text-xs text-brand-green font-medium">
                      Ритм
                    </span>
                    <span className="px-4 py-2 bg-white rounded-full text-xs text-brand-green font-medium">
                      Музыка
                    </span>
                    <span className="px-4 py-2 bg-white rounded-full text-xs text-brand-green font-medium">
                      Поток
                    </span>
                  </div>
                  <button
                    onClick={() => toggle('flow')}
                    className="md:hidden p-2 bg-white rounded-full text-brand-green shadow-sm"
                  >
                    {expanded === 'flow' ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="md:w-1/2 w-full aspect-square md:aspect-[4/3] rounded-[2.5rem] overflow-hidden order-1 md:order-2 shadow-sm">
                <Image
                  src={`${import.meta.env.BASE_URL}images/directions/direction-inside-flow.jpg`}
                  alt="Inside Flow - Warrior Pose"
                  storageKey="direction-inside-flow"
                  containerClassName="w-full h-full"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Hatha Yoga Card */}
        <FadeIn delay={200} direction="up">
          <div className="group bg-[#f5f5f4] rounded-[3rem] p-8 md:p-16 transition-colors hover:bg-[#ebebea]">
            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-20">
              <div className="md:w-1/2 w-full aspect-square md:aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-sm">
                <Image
                  src={`${import.meta.env.BASE_URL}images/directions/direction-hatha.jpg`}
                  alt="Hatha Yoga"
                  storageKey="direction-hatha"
                  containerClassName="w-full h-full"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="md:w-1/2">
                <h3 className="text-3xl md:text-5xl font-serif text-brand-text mb-6">Хатха йога</h3>

                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${expanded === 'hatha' ? 'max-h-[500px]' : 'max-h-[100px] md:max-h-full'}`}
                >
                  <p className="text-brand-text/70 text-lg leading-relaxed mb-4">
                    Физическая форма йоги, включающая дыхательные упражнения, асаны и очищающие
                    практики. Улучшает гибкость, силу, снижает стресс, повышает осознанность и
                    баланс.
                  </p>
                  <p
                    className={`text-brand-text/70 text-lg leading-relaxed mb-8 ${expanded === 'hatha' ? 'block' : 'hidden'}`}
                  >
                    Мы уделяем особое внимание отстройке асан и безопасности. Практика подходит как
                    для начинающих, так и для продвинутых, так как всегда есть варианты упрощения и
                    усложнения.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex flex-wrap gap-3">
                    <span className="px-4 py-2 bg-white rounded-full text-xs text-stone-500 font-medium">
                      Сила
                    </span>
                    <span className="px-4 py-2 bg-white rounded-full text-xs text-stone-500 font-medium">
                      Баланс
                    </span>
                    <span className="px-4 py-2 bg-white rounded-full text-xs text-stone-500 font-medium">
                      Дыхание
                    </span>
                  </div>
                  <button
                    onClick={() => toggle('hatha')}
                    className="md:hidden p-2 bg-white rounded-full text-stone-500 shadow-sm"
                  >
                    {expanded === 'hatha' ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
