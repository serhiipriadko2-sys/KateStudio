
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Calendar as CalendarIcon, MapPin, Video, Clock, ChevronRight, ChevronLeft, Users, Info, Flame, Loader2, WifiOff, Hand } from 'lucide-react';
import { BookingModal } from './BookingModal';
import { FadeIn } from './FadeIn';
import { dataService } from '../services/dataService';
import { ClassSession } from '../types';
import { supabase } from '../services/supabaseClient';

export const Schedule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'offline' | 'online'>(() => {
    return (sessionStorage.getItem('ksebe_schedule_tab') as 'offline' | 'online') || 'offline';
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDateNum, setSelectedDateNum] = useState<number>(new Date().getDate());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassSession | null>(null);
  
  // Real data state
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Swipe Refs
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Persist tab change
  useEffect(() => {
    sessionStorage.setItem('ksebe_schedule_tab', activeTab);
  }, [activeTab]);

  // Construct full Date object for selected day
  const getSelectedDate = useCallback(() => {
    const d = new Date(currentMonth);
    d.setDate(selectedDateNum);
    return d;
  }, [currentMonth, selectedDateNum]);

  // Fetch Logic extracted for reuse
  const fetchClasses = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(false);
    try {
        const date = getSelectedDate();
        const fetchedClasses = await dataService.getClassesForDate(date, activeTab);
        setClasses(fetchedClasses);
    } catch (e) {
        console.error("Failed to load schedule", e);
        setError(true);
    } finally {
        if (showLoading) setLoading(false);
    }
  }, [getSelectedDate, activeTab]);

  // Initial Fetch & Real-time Subscription
  useEffect(() => {
    fetchClasses(true);

    // Subscribe to changes in bookings to update seat counts in real-time
    const channel = supabase
      .channel('public:bookings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
         // When any booking is added or removed, refresh the schedule
         // false = don't show full loading spinner, just update data
         fetchClasses(false); 
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    }
  }, [fetchClasses]);


  const changeMonth = (offset: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentMonth(newDate);
    setSelectedDateNum(1); 
  };

  const selectDate = (day: number, offsetMonth: number = 0) => {
      if (offsetMonth === 0) {
          setSelectedDateNum(day);
      } else {
          const newDate = new Date(currentMonth);
          newDate.setMonth(newDate.getMonth() + offsetMonth);
          setCurrentMonth(newDate);
          setSelectedDateNum(day);
      }
  };

  // Swipe logic
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };
  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) changeMonth(1); // Swipe Left -> Next Month
    if (distance < -50) changeMonth(-1); // Swipe Right -> Prev Month
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentMonth(now);
    setSelectedDateNum(now.getDate());
  };
  
  // Refetch when dependencies change
  useEffect(() => {
     fetchClasses(true);
  }, [currentMonth, selectedDateNum, activeTab]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1; // 0 = Mon, 6 = Sun
  };

  const handleBookingClick = (cls: ClassSession) => {
    setSelectedClass(cls);
    setIsModalOpen(true);
  };

  // --- Render Helpers ---
  const renderIntensity = (level: number) => {
    return (
      <div className="flex gap-0.5 mt-2" title={`Интенсивность: ${level}/3`}>
        {[1, 2, 3].map((i) => (
          <Flame key={i} className={`w-3 h-3 ${i <= level ? 'text-brand-green fill-brand-green' : 'text-stone-200'}`} />
        ))}
      </div>
    );
  };

  const renderCalendar = () => {
    const days = [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const daysInCurrentMonth = getDaysInMonth(currentMonth);
    const firstDayIndex = getFirstDayOfMonth(currentMonth); // 0 (Mon) to 6 (Sun)
    
    const prevMonthDate = new Date(year, month - 1, 1);
    const daysInPrevMonth = getDaysInMonth(prevMonthDate);

    const today = new Date();
    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

    // Previous Month Days (Grayed out)
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      days.push(
        <button 
            key={`prev-${dayNum}`}
            onClick={() => selectDate(dayNum, -1)}
            className="h-10 md:h-12 flex items-center justify-center text-stone-300 hover:bg-stone-50 rounded-xl transition-colors text-sm"
        >
            {dayNum}
        </button>
      );
    }

    // Current Month Days
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      const isSelected = selectedDateNum === i;
      const isToday = isCurrentMonth && today.getDate() === i;
      const dayOfWeek = new Date(year, month, i).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      days.push(
        <button 
          key={`curr-${i}`} 
          onClick={() => selectDate(i, 0)}
          className={`
            relative p-1 md:p-2 rounded-xl md:rounded-2xl transition-all duration-300 flex flex-col items-center justify-center h-10 md:h-12
            ${isSelected ? 'bg-brand-green text-white shadow-lg shadow-brand-green/30 scale-105 z-10' : ''}
            ${!isSelected ? 'hover:bg-stone-50 bg-white border border-stone-100 text-brand-text' : ''}
            ${!isSelected && isToday ? 'ring-1 ring-brand-green ring-offset-1' : ''}
          `}
        >
          <span className={`text-sm font-medium ${isSelected ? 'text-white' : ''}`}>{i}</span>
          {!isSelected && (
              <div className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full mx-auto mt-0.5 md:mt-1 ${isWeekend ? 'bg-emerald-400' : 'bg-amber-400 opacity-0'}`}></div>
          )}
        </button>
      );
    }

    // Next Month Days (Grayed out) - Fill remaining grid cells (assuming 6 rows max = 42 cells)
    const totalSlots = 42; 
    const filledSlots = days.length;
    const remainingSlots = totalSlots - filledSlots;
    
    // Only fill if we want a fixed grid height, or just enough to finish the week row
    // Let's fill to finish the current row at least, or maybe 1 full row more if it looks empty
    const slotsToFill = remainingSlots > 6 ? remainingSlots : remainingSlots + 7; // Ensure nice look

    for (let i = 1; i <= slotsToFill && i <= 14; i++) { // Limit to avoid huge empty grids
        if (days.length >= 42) break; // Hard stop at 6 rows
        days.push(
            <button 
                key={`next-${i}`}
                onClick={() => selectDate(i, 1)}
                className="h-10 md:h-12 flex items-center justify-center text-stone-300 hover:bg-stone-50 rounded-xl transition-colors text-sm"
            >
                {i}
            </button>
        );
    }

    return days;
  };

  return (
    <section id="schedule" className="py-12 md:py-24 px-4 md:px-12 max-w-7xl mx-auto scroll-mt-20">
      <div className="text-center mb-12">
        <FadeIn>
          <h4 className="text-brand-green tracking-[0.2em] text-xs font-bold uppercase mb-4">Запись</h4>
          <h2 className="text-4xl md:text-6xl font-serif text-brand-text/90 mb-6">Расписание</h2>
          <p className="text-stone-500 max-w-2xl mx-auto">
            Выберите удобный день в календаре.
          </p>
        </FadeIn>
      </div>

      <div className="flex justify-center mb-12">
        <FadeIn delay={100}>
          <div className="bg-stone-100 p-1.5 rounded-full inline-flex relative shadow-inner">
            <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-full shadow-sm transition-all duration-300 ease-out ${activeTab === 'online' ? 'translate-x-[calc(100%+6px)]' : 'translate-x-0'}`}></div>
            <button onClick={() => { setActiveTab('offline'); setSelectedDateNum(1); }} className={`relative z-10 px-8 py-3 rounded-full text-sm font-medium transition-colors duration-300 ${activeTab === 'offline' ? 'text-brand-green' : 'text-stone-500 hover:text-brand-text'}`}>В студии</button>
            <button onClick={() => { setActiveTab('online'); setSelectedDateNum(1); }} className={`relative z-10 px-8 py-3 rounded-full text-sm font-medium transition-colors duration-300 ${activeTab === 'online' ? 'text-brand-green' : 'text-stone-500 hover:text-brand-text'}`}>Онлайн</button>
          </div>
        </FadeIn>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 min-h-[500px]">
        {/* Calendar Widget */}
        <div className="lg:w-5/12">
           <FadeIn delay={200} direction="right">
             <div 
               className="bg-white/80 backdrop-blur-sm rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-stone-100 border border-stone-100 sticky top-24"
               onTouchStart={onTouchStart}
               onTouchMove={onTouchMove}
               onTouchEnd={onTouchEnd}
             >
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                     <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-stone-50 rounded-full transition-colors active:scale-90"><ChevronLeft className="w-5 h-5 text-stone-400" /></button>
                     <span className="text-lg font-serif capitalize text-brand-text min-w-[120px] text-center select-none">{currentMonth.toLocaleString('ru', { month: 'long', year: 'numeric' })}</span>
                     <button onClick={() => changeMonth(1)} className="p-2 hover:bg-stone-50 rounded-full transition-colors active:scale-90"><ChevronRight className="w-5 h-5 text-stone-400" /></button>
                  </div>
                  <button 
                    onClick={goToToday}
                    className="text-[10px] font-bold uppercase tracking-wider text-brand-green bg-brand-mint/20 hover:bg-brand-mint/50 px-3 py-1.5 rounded-full transition-colors"
                  >
                    Сегодня
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center mb-4">
                  {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d => (<div key={d} className="text-xs text-stone-400 font-bold uppercase">{d}</div>))}
                </div>
                <div className="grid grid-cols-7 gap-1.5 md:gap-3">{renderCalendar()}</div>
                
                {/* Visual Swipe Hint */}
                <div className="md:hidden flex justify-center mt-6">
                   <div className="flex items-center gap-2 text-stone-300 animate-pulse">
                      <Hand className="w-4 h-4 animate-hand-swipe" />
                   </div>
                </div>
             </div>
           </FadeIn>
        </div>

        {/* Classes List */}
        <div className="lg:w-7/12 flex flex-col">
          <FadeIn delay={300} direction="left">
            <div className="mb-6 flex items-end gap-4 pl-2">
               <h3 className="text-4xl md:text-5xl font-serif text-brand-text capitalize">{selectedDateNum} {currentMonth.toLocaleString('ru', { month: 'long' })}</h3>
               <span className="text-stone-400 pb-1.5 text-sm md:text-base">Расписание</span>
            </div>
            <div className="space-y-4">
               {loading ? (
                   <div className="flex justify-center py-12">
                       <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
                   </div>
               ) : error ? (
                   <div className="p-12 text-center bg-rose-50 rounded-[2rem] border-2 border-dashed border-rose-200">
                       <WifiOff className="w-10 h-10 text-rose-300 mx-auto mb-3" />
                       <p className="text-rose-600 font-medium">Не удалось загрузить расписание</p>
                       <p className="text-rose-400 text-sm mt-1">Проверьте соединение с интернетом</p>
                   </div>
               ) : (
                   <>
                    {classes.map((cls, idx) => {
                        const percentage = (cls.spotsBooked / cls.spotsTotal) * 100;
                        const isFull = cls.spotsBooked >= cls.spotsTotal;
                        let statusColor = "bg-emerald-400";
                        if (percentage > 85) statusColor = "bg-rose-400";
                        else if (percentage > 50) statusColor = "bg-amber-400";

                        return (
                        <FadeIn key={cls.id} delay={300 + (idx * 50)} direction="up">
                            <div className="group relative bg-white p-5 md:p-6 rounded-[2rem] border border-stone-100 shadow-sm hover:shadow-lg hover:border-brand-green/30 transition-all duration-300 hover:scale-[1.01]">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-start gap-6">
                                    <div className="flex flex-col items-center min-w-[60px]">
                                        <span className="text-2xl font-serif text-brand-text">{cls.time}</span>
                                        <span className="text-xs text-stone-400 bg-stone-50 px-2 py-1 rounded-md mt-1">{cls.duration}</span>
                                    </div>
                                    <div className="w-[1px] h-12 bg-stone-100 hidden md:block"></div>
                                    <div>
                                        <h4 className="text-lg font-medium text-brand-text group-hover:text-brand-green transition-colors">{cls.name}</h4>
                                        <div className="flex flex-col gap-1 mt-1 text-sm text-stone-500">
                                            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {cls.location}</span>
                                            <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {cls.instructor}</span>
                                        </div>
                                        {renderIntensity(cls.intensity)}
                                    </div>
                                    </div>
                                    <div className="flex flex-col justify-end gap-4 md:w-auto w-full">
                                    <div className="flex flex-col w-full md:w-32">
                                        <div className="flex justify-between text-xs mb-1.5 font-medium">
                                            <span className={isFull ? 'text-rose-500' : 'text-stone-500'}>{isFull ? 'Мест нет' : `${cls.spotsTotal - cls.spotsBooked} мест`}</span>
                                            <span className="text-stone-300">{cls.spotsBooked}/{cls.spotsTotal}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-stone-300' : statusColor}`} style={{ width: `${percentage}%` }}></div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => !isFull && handleBookingClick(cls)} 
                                        disabled={isFull} 
                                        className={`px-6 py-3 rounded-xl font-medium transition-all text-sm whitespace-nowrap shadow-sm hover:shadow-md active:scale-95 ${isFull ? 'bg-stone-100 text-stone-400 cursor-not-allowed shadow-none' : 'bg-brand-mint/50 text-brand-green hover:bg-brand-green hover:text-white'}`}
                                    >
                                        {isFull ? 'Лист ожидания' : 'Записаться'}
                                    </button>
                                    </div>
                                </div>
                            </div>
                        </FadeIn>
                        );
                    })}
                    {classes.length === 0 && (
                        <FadeIn delay={300}>
                            <div className="p-12 text-center bg-stone-50 rounded-[2rem] border-2 border-dashed border-stone-200">
                            <Info className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                            <p className="text-stone-500">На этот день занятий не запланировано.</p>
                            </div>
                        </FadeIn>
                    )}
                   </>
               )}
            </div>
          </FadeIn>
        </div>
      </div>
      
      {selectedClass && (
        <BookingModal 
            isOpen={isModalOpen} 
            onClose={() => { setIsModalOpen(false); setSelectedClass(null); }} 
            classDetails={selectedClass} 
            onSuccess={() => fetchClasses(false)} 
        />
      )}
    </section>
  );
};
