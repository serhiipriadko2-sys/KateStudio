
import React, { useState } from 'react';
import { ArrowRight, Calendar, MapPin, X, Mountain, Coffee, Sun, Moon, Camera } from 'lucide-react';
import { FadeIn } from './FadeIn';
import { Image } from './Image';
import { useToast } from '../context/ToastContext';

export const Retreats: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  const handleBook = () => {
    setIsModalOpen(false);
    // Dispatch custom event for ChatWidget
    const event = new CustomEvent('ksebe-open-chat', { 
        detail: { message: `Здравствуйте! Я хочу забронировать место в йога-туре "Сила Тишины" на Алтае.` } 
    });
    window.dispatchEvent(event);
    showToast('Переходим в чат для бронирования...', 'success');
  };

  const programDays = [
    { day: 1, title: "Прибытие и знакомство", icon: <Mountain className="w-5 h-5" />, desc: "Встреча в аэропорту Горно-Алтайска. Трансфер на базу. Расселение в эко-домиках. Вечерний круг знакомства у костра и практика настройки." },
    { day: 2, title: "Дыхание гор", icon: <Sun className="w-5 h-5" />, desc: "Утренняя пранаяма на рассвете. Прогулка к водопаду Чили. Мягкая Хатха-йога для адаптации. Лекция: «Философия йоги в повседневной жизни»." },
    { day: 3, title: "Поток энергии", icon: <Coffee className="w-5 h-5" />, desc: "Активная практика Inside Flow под музыку. Свободное время для чтения и созерцания. Вечерняя медитация под звуки поющих чаш." },
    { day: 4, title: "День Тишины (Мауна)", icon: <Moon className="w-5 h-5" />, desc: "День без гаджетов и разговоров. Погружение в себя. Практика инь-йоги. Вечером — традиционная баня с травами и выход из молчания." },
    { day: 5, title: "Марсианские пейзажи", icon: <Camera className="w-5 h-5" />, desc: "Выездная экскурсия на «Марс» — уникальные цветные горы Кызыл-Чина. Фотосессия в летящих платьях. Пикник на природе." },
    { day: 6, title: "Единство", icon: <Sun className="w-5 h-5" />, desc: "Партнерская йога. Доверительные практики. Прощальный гала-ужин, обмен впечатлениями и подарками." },
    { day: 7, title: "Возвращение", icon: <Mountain className="w-5 h-5" />, desc: "Финальная утренняя садхана. Завтрак. Трансфер в аэропорт. Объятия и обещание встретиться снова." }
  ];

  return (
    <>
      <section id="retreats" className="py-24 px-4 md:px-12 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="relative rounded-[3rem] overflow-hidden min-h-[500px] group cursor-pointer shadow-2xl" onClick={() => setIsModalOpen(true)}>
              {/* Using 'retreat-cover' simple key to try and catch legacy user upload */}
              <Image 
                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop" 
                alt="Yoga Retreat Altai" 
                storageKey="retreat-cover"
                containerClassName="absolute inset-0 w-full h-full"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 pointer-events-none"></div>
              
              <div className="absolute bottom-0 left-0 p-8 md:p-16 w-full md:w-2/3 text-white z-20">
                <div className="flex flex-wrap gap-4 mb-6">
                    <span className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium border border-white/10">
                        <Calendar className="w-4 h-4" /> 15 — 22 Августа
                    </span>
                    <span className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium border border-white/10">
                        <MapPin className="w-4 h-4" /> Алтай
                    </span>
                </div>
                <h2 className="text-4xl md:text-6xl font-serif mb-6 leading-tight">
                  Йога-тур "Сила Тишины"
                </h2>
                <p className="text-lg text-white/80 mb-8 leading-relaxed max-w-xl">
                  7 дней перезагрузки в горах. Ежедневные практики на рассвете, медитации у горной реки, баня и душевные разговоры у костра. Подари себе время быть настоящим.
                </p>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
                  className="flex items-center gap-4 group/btn"
                >
                  <span className="w-14 h-14 bg-brand-green rounded-full flex items-center justify-center text-white group-hover/btn:bg-white group-hover/btn:text-brand-green transition-colors shadow-lg shadow-brand-green/30">
                    <ArrowRight className="w-6 h-6" />
                  </span>
                  <span className="text-lg font-medium tracking-wide">Узнать программу</span>
                </button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Program Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl h-[85vh] rounded-[2.5rem] shadow-2xl overflow-hidden relative flex flex-col md:flex-row animate-in slide-in-from-bottom-10 duration-300">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 bg-white/50 backdrop-blur rounded-full hover:bg-white transition-colors z-20"
            >
              <X className="w-6 h-6 text-stone-800" />
            </button>

            {/* Left/Top Image Panel */}
            <div className="md:w-1/3 h-48 md:h-full relative">
              <Image 
                src="https://images.unsplash.com/photo-1518182170546-0766be6f5a56?q=80&w=800&auto=format&fit=crop" 
                alt="Altai Nature Detail" 
                storageKey="retreat-modal"
                containerClassName="w-full h-full"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-brand-green/20 mix-blend-multiply z-10 pointer-events-none"></div>
              <div className="absolute bottom-6 left-6 text-white md:block hidden z-20 pointer-events-none">
                <h3 className="text-3xl font-serif mb-2">Алтай</h3>
                <p className="opacity-80">Место силы</p>
              </div>
            </div>

            {/* Right Content Panel */}
            <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar bg-white">
              <div className="mb-8">
                 <h2 className="text-3xl md:text-4xl font-serif text-brand-text mb-2">Программа тура</h2>
                 <p className="text-brand-text/60">Баланс практики и приключений</p>
              </div>

              <div className="space-y-6">
                {programDays.map((day) => (
                  <div key={day.day} className="flex gap-4 group">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-brand-mint text-brand-green flex items-center justify-center font-serif text-lg shrink-0 group-hover:bg-brand-green group-hover:text-white transition-colors">
                        {day.day}
                      </div>
                      <div className="w-[1px] h-full bg-stone-100 my-2 group-last:hidden"></div>
                    </div>
                    <div className="pb-6">
                      <h4 className="text-xl font-medium text-brand-text mb-2 flex items-center gap-2">
                        {day.title}
                        <span className="text-stone-300 scale-75 opacity-0 group-hover:opacity-100 transition-opacity">{day.icon}</span>
                      </h4>
                      <p className="text-brand-text/70 text-sm leading-relaxed">
                        {day.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-stone-100 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                   <div className="text-xs text-stone-400 uppercase tracking-wider mb-1">Стоимость участия</div>
                   <div className="text-3xl font-serif text-brand-text">65 000 ₽</div>
                </div>
                <button 
                  onClick={handleBook}
                  className="w-full md:w-auto px-8 py-4 bg-brand-green text-white rounded-xl font-medium hover:bg-brand-green/90 transition-colors shadow-lg shadow-brand-green/20"
                >
                  Забронировать место
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
