import { IMAGES } from '@ksebe/shared';
import { Calendar, MapPin, Users } from 'lucide-react';
import React from 'react';
import { Image } from './Image';

export const Retreats: React.FC = () => {
  return (
    <section className="py-24 bg-stone-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-in slide-in-from-left duration-700">
            <div>
              <span className="text-brand-green font-bold tracking-widest uppercase text-sm mb-2 block">
                Путешествия
              </span>
              <h2 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">
                Йога-туры
                <br />
                <span className="text-stone-500">по всему миру</span>
              </h2>
              <p className="text-stone-400 text-lg leading-relaxed max-w-md">
                Глубокое погружение в практику в самых красивых уголках планеты. Перезагрузка тела и
                ума в компании единомышленников.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center shrink-0">
                  <Calendar className="w-6 h-6 text-brand-green" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Ближайший тур</h4>
                  <p className="text-stone-400">15–25 Мая 2026</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-brand-green" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Локация</h4>
                  <p className="text-stone-400">Бали, Убуд — место силы</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-brand-green" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Группа</h4>
                  <p className="text-stone-400">Камерный формат до 12 человек</p>
                </div>
              </div>
            </div>

            <button className="bg-brand-green text-white px-8 py-4 rounded-full font-bold uppercase tracking-wider hover:bg-white hover:text-brand-dark transition-all duration-300">
              Получить программу
            </button>
          </div>

          <div className="relative h-[600px] hidden md:block animate-in slide-in-from-right duration-700 delay-200">
            <div className="absolute top-0 right-0 w-3/4 h-3/4 rounded-[3rem] overflow-hidden">
              <Image
                src={IMAGES.retreats.main}
                alt="Retreat"
                storageKey="retreat-main"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 left-0 w-2/3 h-2/3 rounded-[3rem] overflow-hidden border-8 border-stone-900 shadow-2xl">
              <Image
                src={IMAGES.retreats.sidebar}
                alt="Yoga Group"
                storageKey="retreat-group"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-brand-green/20 backdrop-blur-xl rounded-full flex items-center justify-center">
              <div className="w-24 h-24 bg-brand-green rounded-full flex items-center justify-center animate-pulse">
                <span className="font-serif text-xl font-bold">2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
