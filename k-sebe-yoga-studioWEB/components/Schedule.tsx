import { ChevronRight, ChevronLeft, MapPin, Users, Info, Flame } from 'lucide-react';
import React, { useState } from 'react';
import { ScheduleTemplate } from '../data/content';
import { useContentData } from '../hooks/useContentData';
import { BookingDetails } from '../types';
import { FadeIn } from './FadeIn';

interface ScheduleProps {
  onBook: (details: BookingDetails) => void;
}

// Mock types/data
type LoadLevel = 'low' | 'medium' | 'high' | 'full' | 'none';
interface ClassSession {
  id: string;
  time: string;
  name: string;
  instructor: string;
  duration: string;
  spotsTotal: number;
  spotsBooked: number;
  location: string;
  intensity: 1 | 2 | 3;
}
const seededRandom = (seed: number) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

export const Schedule: React.FC<ScheduleProps> = ({ onBook }) => {
  const { schedule } = useContentData();
  const [activeTab, setActiveTab] = useState<'offline' | 'online'>('offline');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<number>(new Date().getDate());

  const getLoadLevel = (day: number, tab: 'offline' | 'online'): LoadLevel => {
    const seed =
      currentMonth.getFullYear() * 10000 +
      currentMonth.getMonth() * 100 +
      day +
      (tab === 'online' ? 500 : 0);
    const rand = seededRandom(seed);
    if (tab === 'online') {
      if (day % 7 === 0) return 'none';
      return 'low';
    }
    if (day % 7 === 0) return 'none';
    if (rand > 0.85) return 'full';
    if (rand > 0.6) return 'high';
    if (rand > 0.3) return 'medium';
    return 'low';
  };

  const getClassList = (day: number, tab: 'offline' | 'online'): ClassSession[] => {
    const baseClasses: ScheduleTemplate[] = tab === 'offline' ? schedule.offline : schedule.online;
    const baseSeed =
      currentMonth.getFullYear() * 10000 +
      currentMonth.getMonth() * 100 +
      day +
      (tab === 'online' ? 999 : 0);
    return baseClasses.map((cls, idx) => {
      const seed = baseSeed + idx * 13;
      const spotsBooked = Math.floor(seededRandom(seed) * (cls.spotsTotal + 1));
      return { ...cls, id: `${day}-${idx}`, instructor: 'Катя Габран', spotsBooked: spotsBooked };
    });
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentMonth(newDate);
    setSelectedDate(1);
  };
  const goToToday = () => {
    const now = new Date();
    setCurrentMonth(now);
    setSelectedDate(now.getDate());
  };
  const getDaysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const handleBookingClick = (cls: ClassSession) => {
    onBook({
      type: cls.name,
      time: cls.time,
      date: `${selectedDate} ${currentMonth.toLocaleString('ru', { month: 'long' })}`,
      location: cls.location,
    });
  };

  const LoadIndicator = ({ level }: { level: LoadLevel }) => {
    if (level === 'none') return null;
    const colors = {
      low: 'bg-emerald-400',
      medium: 'bg-amber-400',
      high: 'bg-rose-400',
      full: 'bg-stone-300',
      none: 'bg-transparent',
    };
    return <div className={`w-1.5 h-1.5 rounded-full ${colors[level]} mx-auto mt-1`}></div>;
  };

  const renderIntensity = (level: number) => (
    <div className="flex gap-0.5 mt-2" title={`Интенсивность: ${level}/3`}>
      {[1, 2, 3].map((i) => (
        <Flame
          key={i}
          className={`w-3 h-3 ${i <= level ? 'text-brand-green fill-brand-green' : 'text-stone-200'}`}
        />
      ))}
    </div>
  );

  const renderCalendar = () => {
    const days = [];
    const totalDays = getDaysInMonth(currentMonth);
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < startOffset; i++)
      days.push(<div key={`empty-${i}`} className="aspect-square w-full"></div>);
    for (let i = 1; i <= totalDays; i++) {
      const load = getLoadLevel(i, activeTab);
      const isSelected = selectedDate === i;
      const isDisabled = load === 'none';
      days.push(
        <button
          key={i}
          onClick={() => !isDisabled && setSelectedDate(i)}
          disabled={isDisabled}
          className={`relative aspect-square p-1 rounded-xl transition-all duration-200 flex flex-col items-center justify-center ${isSelected ? 'bg-brand-green text-white shadow-md scale-105 z-10' : ''} ${!isSelected && !isDisabled ? 'hover:bg-stone-50 bg-white border border-stone-100 text-brand-text' : ''} ${isDisabled ? 'opacity-30 cursor-not-allowed text-stone-300' : ''}`}
        >
          <span className={`text-sm md:text-base font-medium ${isSelected ? 'text-white' : ''}`}>
            {i}
          </span>
          {!isDisabled && <LoadIndicator level={load} />}
        </button>
      );
    }
    return days;
  };

  return (
    <section id="schedule" className="py-24 px-4 md:px-12 max-w-7xl mx-auto scroll-mt-20">
      <div className="text-center mb-12">
        <FadeIn>
          <h4 className="text-brand-green tracking-[0.2em] text-xs font-bold uppercase mb-4">
            Запись
          </h4>
          <h2 className="text-4xl md:text-6xl font-serif text-brand-text/90 mb-6">Расписание</h2>
        </FadeIn>
      </div>
      <div className="flex justify-center mb-12">
        <FadeIn delay={100}>
          <div className="bg-stone-100 p-1.5 rounded-full inline-flex relative">
            <div
              className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-full shadow-sm transition-all duration-300 ease-out ${activeTab === 'online' ? 'translate-x-[calc(100%+6px)]' : 'translate-x-0'}`}
            ></div>
            <button
              onClick={() => {
                setActiveTab('offline');
                setSelectedDate(1);
              }}
              className={`relative z-10 px-8 py-3 rounded-full text-sm font-medium transition-colors duration-300 ${activeTab === 'offline' ? 'text-brand-green' : 'text-stone-500 hover:text-brand-text'}`}
            >
              В студии
            </button>
            <button
              onClick={() => {
                setActiveTab('online');
                setSelectedDate(1);
              }}
              className={`relative z-10 px-8 py-3 rounded-full text-sm font-medium transition-colors duration-300 ${activeTab === 'online' ? 'text-brand-green' : 'text-stone-500 hover:text-brand-text'}`}
            >
              Онлайн
            </button>
          </div>
        </FadeIn>
      </div>
      <div className="flex flex-col lg:flex-row gap-12 min-h-[500px]">
        <div className="lg:w-5/12">
          <FadeIn delay={200} direction="right">
            <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-stone-100 border border-stone-100">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => changeMonth(-1)}
                    className="p-2 hover:bg-stone-50 rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-stone-400" />
                  </button>
                  <span className="text-xl font-serif capitalize text-brand-text">
                    {currentMonth.toLocaleString('ru', { month: 'long', year: 'numeric' })}
                  </span>
                  <button
                    onClick={() => changeMonth(1)}
                    className="p-2 hover:bg-stone-50 rounded-full transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-stone-400" />
                  </button>
                </div>
                <button
                  onClick={goToToday}
                  className="text-xs uppercase tracking-wider font-bold text-brand-green hover:bg-brand-mint/30 px-3 py-1.5 rounded-full transition-colors"
                >
                  Сегодня
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center mb-4">
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) => (
                  <div
                    key={d}
                    className="text-[10px] md:text-xs text-stone-400 font-bold uppercase"
                  >
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">{renderCalendar()}</div>
            </div>
          </FadeIn>
        </div>
        <div className="lg:w-7/12 flex flex-col">
          <FadeIn delay={300} direction="left">
            <div className="mb-6 flex items-end gap-4">
              <h3 className="text-4xl md:text-5xl font-serif text-brand-text capitalize">
                {selectedDate} {currentMonth.toLocaleString('ru', { month: 'long' })}
              </h3>
              <span className="text-stone-400 pb-1.5 text-sm md:text-base">Расписание</span>
            </div>
            <div className="space-y-4">
              {getClassList(selectedDate, activeTab).map((cls, idx) => {
                const percentage = (cls.spotsBooked / cls.spotsTotal) * 100;
                const isFull = cls.spotsBooked >= cls.spotsTotal;
                return (
                  <FadeIn key={cls.id} delay={300 + idx * 50} direction="up">
                    <div className="group relative bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm hover:shadow-lg hover:border-brand-green/30 transition-all duration-300">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-start gap-6">
                          <div className="flex flex-col items-center min-w-[60px]">
                            <span className="text-2xl font-serif text-brand-text">{cls.time}</span>
                            <span className="text-xs text-stone-400 bg-stone-50 px-2 py-1 rounded-md mt-1 whitespace-nowrap">
                              {cls.duration}
                            </span>
                          </div>
                          <div className="w-[1px] h-12 bg-stone-100 hidden md:block"></div>
                          <div>
                            <h4 className="text-lg font-medium text-brand-text group-hover:text-brand-green transition-colors">
                              {cls.name}
                            </h4>
                            <div className="flex flex-col gap-1 mt-1 text-sm text-stone-500">
                              <span className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5" /> {cls.location}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5" /> {cls.instructor}
                              </span>
                            </div>
                            {renderIntensity(cls.intensity)}
                          </div>
                        </div>
                        <div className="flex flex-col min-w-[140px] mt-4 md:mt-0">
                          <div className="flex justify-between text-xs mb-1.5 font-medium">
                            <span className={isFull ? 'text-rose-500' : 'text-stone-500'}>
                              {isFull ? 'Мест нет' : `${cls.spotsTotal - cls.spotsBooked} мест`}
                            </span>
                            <span className="text-stone-300">
                              {cls.spotsBooked}/{cls.spotsTotal}
                            </span>
                          </div>
                          <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-stone-300' : percentage > 85 ? 'bg-rose-400' : percentage > 50 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <button
                          onClick={() => !isFull && handleBookingClick(cls)}
                          disabled={isFull}
                          className={`w-full md:w-auto px-6 py-3 rounded-xl font-medium transition-all text-sm whitespace-nowrap mt-4 md:mt-0 ${isFull ? 'bg-stone-100 text-stone-400 cursor-not-allowed' : 'bg-brand-mint/50 text-brand-green hover:bg-brand-green hover:text-white'}`}
                        >
                          {isFull ? 'Лист ожидания' : 'Записаться'}
                        </button>
                      </div>
                    </div>
                  </FadeIn>
                );
              })}
              {getClassList(selectedDate, activeTab).length === 0 && (
                <FadeIn delay={300}>
                  <div className="p-12 text-center bg-stone-50 rounded-[2rem] border-2 border-dashed border-stone-200">
                    <Info className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                    <p className="text-stone-500">На этот день занятий не запланировано.</p>
                  </div>
                </FadeIn>
              )}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};
