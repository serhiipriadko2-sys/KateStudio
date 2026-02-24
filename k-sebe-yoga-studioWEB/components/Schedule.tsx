import { BookingDetails, ClassRow, ClassSession, LoadLevel, supabase } from '@ksebe/shared';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Info, Loader2, MapPin, Users } from 'lucide-react';
import React, { useState } from 'react';
import { FadeIn } from './FadeIn';

interface ScheduleProps {
  onBook: (details: BookingDetails) => void;
  isDemo?: boolean;
}

const mapClassRow = (row: ClassRow, activeTab: 'offline' | 'online'): ClassSession => {
  // Handle intensity being string or number
  const rawIntensity = row.intensity;
  let intensityValue = 1;

  if (typeof rawIntensity === 'number') {
    intensityValue = rawIntensity;
  } else if (typeof rawIntensity === 'string') {
    intensityValue = parseInt(rawIntensity, 10);
  }

  // Map numeric intensity to LoadLevel if needed, or just use as is if UI expects specific enum
  // The UI renderIntensity expects 1 | 2 | 3.
  // But ClassSession defines intensity as LoadLevel ('low' | 'medium' | 'high').
  // Let's map it.
  let intensity: LoadLevel = 'low';
  if (intensityValue === 2) intensity = 'medium';
  if (intensityValue >= 3) intensity = 'high';

  return {
    id: row.id,
    dateStr: row.date,
    date: row.date,
    time: row.time,
    name: row.name,
    instructor: row.instructor ?? 'Катя Габран',
    duration: typeof row.duration === 'string' ? parseInt(row.duration, 10) : (row.duration ?? 60),
    spotsTotal: row.spots_total ?? 0,
    spotsBooked: row.spots_booked ?? 0,
    location: row.location ?? (activeTab === 'online' ? 'Online' : 'Станционная ул., 5Б'),
    intensity,
    type: activeTab === 'online' ? 'online' : 'group',
    price: row.price ?? 0,
    description: row.description ?? undefined,
  };
};

export const Schedule: React.FC<ScheduleProps> = ({ onBook, isDemo }) => {
  const [activeTab, setActiveTab] = useState<'offline' | 'online'>('offline');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<number>(new Date().getDate());

  const { data: classes, isLoading } = useQuery({
    queryKey: ['classes', activeTab, currentMonth.getMonth(), currentMonth.getFullYear()],
    queryFn: async () => {
      if (!supabase) return [];

      const startOfMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1
      ).toISOString();
      const endOfMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        0
      ).toISOString();

      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('is_online', activeTab === 'online')
        .gte('date', startOfMonth)
        .lte('date', endOfMonth)
        .order('date')
        .order('time');

      if (error) throw error;
      // We cast here because Supabase types might be slightly different or inferred
      return (data || []) as unknown as ClassRow[];
    },
  });

  const selectedClasses =
    classes
      ?.map((row) => mapClassRow(row, activeTab))
      .filter((c) => {
        const d = new Date(c.date);
        return d.getDate() === selectedDate;
      }) || [];

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  // Adjust for Monday start (0=Sun -> 6, 1=Mon -> 0)
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  const changeMonth = (delta: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1));
    setSelectedDate(1);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today.getDate());
  };

  const handleBookingClick = (cls: ClassSession) => {
    onBook({
      type: cls.name,
      date: `${cls.dateStr} ${cls.time}`,
      price: `${cls.price}₽`,
      classId: cls.id,
    });
  };

  const renderIntensity = (level: LoadLevel) => {
    const count = level === 'high' ? 3 : level === 'medium' ? 2 : 1;
    return (
      <div className="flex gap-1 mt-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${i < count ? 'bg-brand-green' : 'bg-stone-200'}`}
          />
        ))}
      </div>
    );
  };

  const renderCalendar = () => {
    const days = [];
    // Empty cells
    for (let i = 0; i < startOffset; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
    }

    // Days
    for (let i = 1; i <= daysInMonth; i++) {
      // Check status for this day
      const dayClasses = classes?.filter((c) => {
        const d = new Date(c.date);
        return d.getDate() === i;
      });

      let statusColor = 'bg-stone-100 text-stone-400'; // Default/Empty

      if (dayClasses && dayClasses.length > 0) {
        // Calculate load
        const totalSpots = dayClasses.reduce((acc, c) => acc + (c.spots_total || 0), 0);
        const bookedSpots = dayClasses.reduce((acc, c) => acc + (c.spots_booked || 0), 0);
        const load = totalSpots > 0 ? bookedSpots / totalSpots : 0;

        if (load >= 1) statusColor = 'bg-rose-400 text-white shadow-md shadow-rose-200';
        else if (load > 0.7) statusColor = 'bg-amber-400 text-white shadow-md shadow-amber-200';
        else statusColor = 'bg-emerald-400 text-white shadow-md shadow-emerald-200';
      }

      const isSelected = i === selectedDate;
      const isToday =
        i === new Date().getDate() &&
        currentMonth.getMonth() === new Date().getMonth() &&
        currentMonth.getFullYear() === new Date().getFullYear();

      days.push(
        <button
          key={i}
          onClick={() => setSelectedDate(i)}
          className={`
            aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300 relative
            ${isSelected ? 'scale-110 ring-2 ring-brand-green ring-offset-2 z-10' : 'hover:scale-105'}
            ${statusColor}
          `}
        >
          {isToday && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full"></span>
          )}
          <span
            className={`text-sm md:text-base font-bold ${isSelected || statusColor.includes('text-white') ? '' : 'text-stone-600'}`}
          >
            {i}
          </span>
        </button>
      );
    }
    return days;
  };

  return (
    <section id="schedule" className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-6 mb-12 flex flex-col md:flex-row justify-between items-end gap-8">
        <FadeIn>
          <div>
            <h4 className="text-brand-green tracking-[0.2em] text-xs font-bold uppercase mb-4">
              Планирование
            </h4>
            <h2 className="text-4xl md:text-6xl font-serif text-brand-text/90 leading-tight">
              Расписание
              <br />
              <span className="italic text-brand-green">практик</span>
            </h2>
          </div>
        </FadeIn>

        <FadeIn direction="left" delay={200}>
          <div className="flex bg-stone-100 p-1.5 rounded-full relative">
            <div
              className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-full shadow-sm transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${activeTab === 'online' ? 'translate-x-full left-1.5' : 'left-1.5'}`}
            ></div>
            <button
              onClick={() => {
                setActiveTab('offline');
                setSelectedDate(new Date().getDate());
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
      <div className="flex flex-col lg:flex-row gap-12 min-h-[500px] px-6 max-w-7xl mx-auto">
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

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 mt-6 text-[10px] text-stone-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span> свободно
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span> заполняется
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span> почти нет мест
                </span>
              </div>
            </div>
          </FadeIn>
        </div>
        <div className="lg:w-7/12 flex flex-col">
          <FadeIn delay={300} direction="left">
            <div className="mb-6 flex items-end gap-4">
              <h3 className="text-4xl md:text-5xl font-serif text-brand-text capitalize">
                {selectedDate} {currentMonth.toLocaleString('ru', { month: 'long' })}
              </h3>
              <div className="flex flex-col">
                <span className="text-stone-400 pb-1.5 text-sm md:text-base">Расписание</span>
                {isDemo && (
                  <span className="text-amber-500 text-xs font-medium">Демонстрационный режим</span>
                )}
              </div>
            </div>
            <div className="space-y-4">
              {isLoading && (
                <FadeIn delay={300}>
                  <div className="p-12 text-center bg-stone-50 rounded-[2rem] border-2 border-dashed border-stone-200">
                    <Loader2 className="w-10 h-10 text-brand-green mx-auto mb-3 animate-spin" />
                    <p className="text-stone-500">Загружаем расписание...</p>
                  </div>
                </FadeIn>
              )}
              {!isLoading &&
                selectedClasses.length > 0 &&
                selectedClasses.map((cls, idx) => {
                  const capacity = cls.spotsTotal;
                  const percentage = capacity > 0 ? (cls.spotsBooked / capacity) * 100 : 0;
                  const isFull = capacity > 0 && cls.spotsBooked >= capacity;
                  const isUnavailable = capacity === 0;
                  return (
                    <FadeIn key={cls.id} delay={300 + idx * 50} direction="up">
                      <div className="group relative bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm hover:shadow-lg hover:border-brand-green/30 transition-all duration-300">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex items-start gap-6">
                            <div className="flex flex-col items-center min-w-[60px]">
                              <span className="text-2xl font-serif text-brand-text">
                                {cls.time}
                              </span>
                              <span className="text-xs text-stone-400 bg-stone-50 px-2 py-1 rounded-md mt-1 whitespace-nowrap">
                                {cls.duration} мин
                              </span>
                              {cls.price !== null && cls.price !== undefined && cls.price > 0 && (
                                <span className="text-xs font-medium text-brand-green mt-1">
                                  {cls.price}₽
                                </span>
                              )}
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
                              <span
                                className={
                                  isFull
                                    ? 'text-rose-500'
                                    : isUnavailable
                                      ? 'text-stone-400'
                                      : 'text-stone-500'
                                }
                              >
                                {isUnavailable
                                  ? 'Уточнить'
                                  : isFull
                                    ? 'Мест нет'
                                    : `${cls.spotsTotal - cls.spotsBooked} мест`}
                              </span>
                              <span className="text-stone-300">
                                {isUnavailable ? '—' : `${cls.spotsBooked}/${cls.spotsTotal}`}
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
                            onClick={() => !isFull && !isUnavailable && handleBookingClick(cls)}
                            disabled={isFull || isUnavailable}
                            className={`w-full md:w-auto px-6 py-3 rounded-xl font-medium transition-all text-sm whitespace-nowrap mt-4 md:mt-0 ${isFull || isUnavailable ? 'bg-stone-100 text-stone-400 cursor-not-allowed' : 'bg-brand-mint/50 text-brand-green hover:bg-brand-green hover:text-white'}`}
                          >
                            {isUnavailable ? 'Уточнить' : isFull ? 'Лист ожидания' : 'Записаться'}
                          </button>
                        </div>
                      </div>
                    </FadeIn>
                  );
                })}
              {!isLoading && selectedClasses.length === 0 && (
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
