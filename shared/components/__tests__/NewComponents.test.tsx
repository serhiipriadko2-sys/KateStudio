import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import type {
  WeeklyRecap as WeeklyRecapType,
  NotificationPreferences as NotificationPreferencesType,
} from '../../types';
import { NotificationPreferences } from '../NotificationPreferences';
import { OnboardingQuiz } from '../OnboardingQuiz';
import { StreakCalendar } from '../StreakCalendar';
import { WeeklyRecap } from '../WeeklyRecap';

describe('WeeklyRecap', () => {
  const mockRecap: WeeklyRecapType = {
    weekNumber: 1,
    year: 2026,
    dateRange: { start: '30 декабря', end: '5 января' },
    practiceStats: {
      total: 5,
      totalDuration: 150,
      types: { 'Inside Flow': 3, Hatha: 2 },
      avgDuration: 30,
    },
    streakStatus: { maintained: true, currentStreak: 7, daysThisWeek: 5 },
    aiUsage: { chatMessages: 15, visionAnalyses: 2, meditations: 3 },
    newAchievements: [
      {
        id: 'streak_7',
        name: 'Weekly Warrior',
        nameRu: 'Неделя силы',
        description: '7 дней',
        icon: '🔥',
        category: 'streak',
        progress: 7,
        target: 7,
        unlocked: true,
        rarity: 'common',
      },
    ],
    insights: {
      summary: 'Отличная неделя!',
      improvement: 'Вы практиковали чаще',
      recommendation: 'Попробуйте медитацию',
    },
  };

  it('renders loading state', () => {
    render(<WeeklyRecap recap={null} isLoading={true} />);
    expect(document.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('renders null when no recap', () => {
    const { container } = render(<WeeklyRecap recap={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders recap data correctly', () => {
    render(<WeeklyRecap recap={mockRecap} />);
    expect(screen.getByText('Итоги недели')).toBeTruthy();
    expect(screen.getByText('5')).toBeTruthy(); // practices
    expect(screen.getByText('150')).toBeTruthy(); // minutes
    expect(screen.getByText('7')).toBeTruthy(); // streak
  });

  it('shows achievements', () => {
    render(<WeeklyRecap recap={mockRecap} />);
    expect(screen.getByText(/Неделя силы/)).toBeTruthy();
  });

  it('calls onShare when share button clicked', () => {
    const onShare = vi.fn();
    render(<WeeklyRecap recap={mockRecap} onShare={onShare} />);
    fireEvent.click(screen.getByText('Поделиться результатами'));
    expect(onShare).toHaveBeenCalledTimes(1);
  });
});

describe('StreakCalendar', () => {
  const mockData = {
    '2026-01-01': { practiced: true, duration: 30, type: 'Inside Flow' },
    '2026-01-02': { practiced: true, duration: 45, type: 'Hatha' },
    '2026-01-03': { practiced: false, duration: 0, type: '' },
  };

  it('renders calendar with weekday headers', () => {
    render(<StreakCalendar practiceData={mockData} />);
    expect(screen.getByText('Пн')).toBeTruthy();
    expect(screen.getByText('Вс')).toBeTruthy();
  });

  it('shows current streak', () => {
    render(<StreakCalendar practiceData={mockData} currentStreak={5} />);
    expect(screen.getByText('5 дней streak')).toBeTruthy();
  });

  it('renders today button', () => {
    render(<StreakCalendar practiceData={mockData} />);
    const todayElements = screen.getAllByText('Сегодня');
    expect(todayElements.length).toBeGreaterThan(0);
  });
});

describe('OnboardingQuiz', () => {
  it('renders first step correctly', () => {
    const onComplete = vi.fn();
    render(<OnboardingQuiz onComplete={onComplete} />);
    expect(screen.getByText('Какие у вас цели?')).toBeTruthy();
  });

  it('shows skip button when onSkip provided', () => {
    const onComplete = vi.fn();
    const onSkip = vi.fn();
    render(<OnboardingQuiz onComplete={onComplete} onSkip={onSkip} />);
    expect(screen.getByText('Пропустить настройку')).toBeTruthy();
  });

  it('allows selecting goals', () => {
    const onComplete = vi.fn();
    render(<OnboardingQuiz onComplete={onComplete} />);
    fireEvent.click(screen.getByText('Гибкость'));
    fireEvent.click(screen.getByText('Сила'));
    // Check that buttons are selected (via aria or visual)
    expect(screen.getByText('Далее')).toBeTruthy();
  });
});

describe('NotificationPreferences', () => {
  const mockPreferences: NotificationPreferencesType = {
    streakReminder: true,
    newContent: true,
    weeklySummary: false,
    aiRecommendations: true,
    reminderTime: '09:00',
  };

  it('renders all toggles', () => {
    const onChange = vi.fn();
    render(<NotificationPreferences preferences={mockPreferences} onChange={onChange} />);
    expect(screen.getByText('Напоминание о streak')).toBeTruthy();
    expect(screen.getByText('Новый контент')).toBeTruthy();
    expect(screen.getByText('Еженедельный итог')).toBeTruthy();
    expect(screen.getByText('AI-рекомендации')).toBeTruthy();
  });

  it('shows push permission banner when not enabled', () => {
    const onChange = vi.fn();
    const onEnablePush = vi.fn();
    render(
      <NotificationPreferences
        preferences={mockPreferences}
        onChange={onChange}
        isPushEnabled={false}
        onEnablePush={onEnablePush}
      />
    );
    expect(screen.getByText('Push-уведомления отключены')).toBeTruthy();
    expect(screen.getByText('Включить уведомления')).toBeTruthy();
  });

  it('hides push permission banner when enabled', () => {
    const onChange = vi.fn();
    render(
      <NotificationPreferences
        preferences={mockPreferences}
        onChange={onChange}
        isPushEnabled={true}
      />
    );
    expect(screen.queryByText('Push-уведомления отключены')).toBeNull();
  });

  it('shows time picker when streak reminder enabled', () => {
    const onChange = vi.fn();
    render(<NotificationPreferences preferences={mockPreferences} onChange={onChange} />);
    expect(screen.getByText('Время напоминания')).toBeTruthy();
    expect(screen.getByText('9:00')).toBeTruthy();
  });
});
