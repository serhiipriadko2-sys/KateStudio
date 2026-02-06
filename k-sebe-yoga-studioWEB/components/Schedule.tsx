import { ChevronRight, ChevronLeft, MapPin, Users, Info, Flame } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../services/supabase';
import { BookingDetails } from '../types';
import { FadeIn } from './FadeIn';

interface ScheduleProps {
  onBook: (details: BookingDetails) => void;
}

type LoadLevel = 'low' | 'medium' | 'high' | 'full' | 'none';

interface ClassSession {
  id: string;
  dateStr: string;
  time: string;
  name: string;
  instructor: string;
  duration: string;
  spotsTotal: number;
  spotsBooked: number;
  location: string;
  intensity: 1 | 2 | 3;
  isOnline: boolean;
}

interface ClassRow {
  id: string;
  date: string;
  time: string;
  name: string;
  instructor: string | null;
  duration: string | null;
  spots_total: number | null;
  spots_booked: number | null;
  location: string | null;
  intensity: number | null;
  is_online: boolean | null;
}

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const Schedule: React.FC<ScheduleProps> = ({ onBook }) => {
  const [activeTab, setActiveTab] = useState<'offline' | 'online'>('offline');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<number>(new Date().getDate());
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setClasses([]);
      return;
    }

    let isActive = true;
    const fetchClasses = async () => {
      setIsLoading(true);
      setHasError(false);

      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      try {
        const { data, error } = await supabase
          .from('classes')
          .select(
            'id,date,time,name,instructor,duration,spots_total,spots_booked,location,intensity,is_online'
          )
          .gte('date', formatDateKey(startDate))
          .lte('date', formatDateKey(endDate))
          .eq('is_online', activeTab === 'online')
          .order('date', { ascending: true })
          .order('time', { ascending: true });

        if (error) throw error;

        const mapped = (data as ClassRow[] | null)?.map((row) => {
          const intensityValue = row.intensity ?? 1;
          const intensity: 1 | 2 | 3 = [1, 2, 3].includes(intensityValue)
            ? (intensityValue as 1 | 2 | 3)
            : 1;

          return {
            id: row.id,
            dateStr: row.date,
            time: row.time,
            name: row.name,
            instructor: row.instructor ?? 'Катя Габран',
            duration: row.duration ?? '60 мин',
            spotsTotal: row.spots_total ?? 0,
            spotsBooked: row.spots_booked ?? 0,
            location: row.location ?? (activeTab === 'online' ? 'Online' : 'Станционная ул., 5Б'),
            intensity,
            isOnline: row.is_online ?? activeTab === 'online',
          };
        });

        if (isActive) {
          setClasses(mapped ?? []);
        }
      } catch (error) {
        if (isActive) {
          setHasError(true);
          setClasses([]);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchClasses();

    return () => {
      isActive = false;
    };
  }, [currentMonth, activeTab]);

  const classesByDay = useMemo(() => {
    const map = new Map<number, ClassSession[]>();
    classes.forEach((cls) => {
      const day = Number(cls.dateStr.split('-')[2]);
      if (!map.has(day)) {
        map.set(day, []);
      }
      map.get(day)?.push(cls);
    });
    return map;
  }, [classes]);

  const selectedDateKey = useMemo(() => {
    const date = new Date(currentMonth);
    date.setDate(selectedDate);
    return formatDateKey(date);
  }, [currentMonth, selectedDate]);

  const selectedClasses = useMemo(
    () => classes.filter((cls) => cls.dateStr === selectedDateKey),
    [classes, selectedDateKey]
  );

  const getLoadLevel = (day: number): LoadLevel => {
    const dayClasses = classesByDay.get(day);
    if (!dayClasses || dayClasses.length === 0) return 'none';
    const totalSpots = dayClasses.reduce((sum, cls) => sum + cls.spotsTotal, 0);
    const bookedSpots = dayClasses.reduce((sum, cls) => sum + cls.spotsBooked, 0);
    if (totalSpots === 0) return 'none';
    const ratio = bookedSpots / totalSpots;
    if (ratio >= 1) return 'full';
    if (ratio > 0.85) return 'high';
    if (ratio > 0.6) return 'medium';
    return 'low';
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
      const load = getLoadLevel(i);
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
              {!isSupabaseConfigured && (
                <FadeIn delay={300}>
                  <div className="p-12 text-center bg-stone-50 rounded-[2rem] border-2 border-dashed border-stone-200">
                    <Info className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                    <p className="text-stone-500">
                      Расписание недоступно: проверьте настройки Supabase.
                    </p>
                  </div>
                </FadeIn>
              )}
              {isSupabaseConfigured && isLoading && (
                <FadeIn delay={300}>
                  <div className="p-12 text-center bg-stone-50 rounded-[2rem] border-2 border-dashed border-stone-200">
                    <Info className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                    <p className="text-stone-500">Загружаем расписание...</p>
                  </div>
                </FadeIn>
              )}
              {isSupabaseConfigured && hasError && !isLoading && (
                <FadeIn delay={300}>
                  <div className="p-12 text-center bg-stone-50 rounded-[2rem] border-2 border-dashed border-stone-200">
                    <Info className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                    <p className="text-stone-500">
                      Не удалось загрузить расписание. Попробуйте позже.
                    </p>
                  </div>
                </FadeIn>
              )}
              {isSupabaseConfigured &&
                !isLoading &&
                !hasError &&
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
              {isSupabaseConfigured && !isLoading && !hasError && selectedClasses.length === 0 && (
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
