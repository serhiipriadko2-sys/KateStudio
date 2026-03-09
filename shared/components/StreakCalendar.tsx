import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { StreakCalendarDay } from '../types';
import { cn } from '../utils';

export interface StreakCalendarProps {
  /**
   * Map of date (YYYY-MM-DD) to practice data
   */
  practiceData: Record<string, StreakCalendarDay>;
  /**
   * Current streak count
   */
  currentStreak?: number;
  /**
   * Callback when a day is clicked
   */
  onDayClick?: (date: string) => void;
  className?: string;
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTHS = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const date = new Date(year, month, 1);

  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }

  return days;
}

function getFirstDayOfWeek(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  // Convert Sunday (0) to 6, Monday (1) to 0, etc.
  return day === 0 ? 6 : day - 1;
}

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function StreakCalendar({
  practiceData,
  currentStreak = 0,
  onDayClick,
  className = '',
}: StreakCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const days = useMemo(() => getDaysInMonth(year, month), [year, month]);
  const firstDayOffset = useMemo(() => getFirstDayOfWeek(year, month), [year, month]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Calculate monthly stats
  const monthlyStats = useMemo(() => {
    let practiceDays = 0;
    let totalMinutes = 0;

    days.forEach((day) => {
      const dateKey = formatDateKey(day);
      const data = practiceData[dateKey];
      if (data?.practiced) {
        practiceDays++;
        totalMinutes += data.duration || 0;
      }
    });

    return { practiceDays, totalMinutes };
  }, [days, practiceData]);

  return (
    <div className={cn('bg-white rounded-2xl shadow-sm border border-gray-100 p-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>

        <div className="text-center">
          <h3 className="font-semibold text-brand-dark">
            {MONTHS[month]} {year}
          </h3>
          {currentStreak > 0 && (
            <div className="flex items-center justify-center gap-1 text-sm text-orange-500 mt-1">
              <Flame className="w-4 h-4" />
              <span>{currentStreak} дней streak</span>
            </div>
          )}
        </div>

        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Today button */}
      <div className="flex justify-center mb-4">
        <button
          onClick={goToToday}
          className="text-xs text-brand-green hover:text-brand-green/80 transition-colors"
        >
          Сегодня
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for offset */}
        {Array.from({ length: firstDayOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Days */}
        {days.map((day) => {
          const dateKey = formatDateKey(day);
          const data = practiceData[dateKey];
          const isToday = day.getTime() === today.getTime();
          const isFuture = day > today;
          const hasPractice = data?.practiced;

          return (
            <button
              key={dateKey}
              onClick={() => onDayClick?.(dateKey)}
              disabled={isFuture}
              className={cn(
                'aspect-square rounded-lg flex items-center justify-center text-sm transition-all relative',
                isToday && 'ring-2 ring-brand-green ring-offset-1',
                hasPractice
                  ? 'bg-brand-green text-white font-medium'
                  : isFuture
                    ? 'text-gray-300 cursor-default'
                    : 'text-gray-600 hover:bg-gray-100',
                onDayClick && !isFuture && 'cursor-pointer'
              )}
            >
              {day.getDate()}

              {/* Practice indicator */}
              {hasPractice && data.duration && data.duration > 0 && (
                <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2">
                  <div className="w-1 h-1 bg-brand-yellow rounded-full" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Monthly stats */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-brand-green">{monthlyStats.practiceDays}</p>
            <p className="text-xs text-gray-500">дней практики</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-green">{monthlyStats.totalMinutes}</p>
            <p className="text-xs text-gray-500">минут всего</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-brand-green" />
          <span>Практика</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded border-2 border-brand-green bg-white" />
          <span>Сегодня</span>
        </div>
      </div>
    </div>
  );
}

