import { Bell, BellOff, Clock, Sparkles, Calendar, Award } from 'lucide-react';
import React from 'react';
import type { NotificationPreferencesData as NotificationPreferencesType } from '../types';
import { cn } from '../utils';

export interface NotificationPreferencesProps {
  preferences: NotificationPreferencesType;
  onChange: (preferences: NotificationPreferencesType) => void;
  isPushEnabled?: boolean;
  onEnablePush?: () => void;
  className?: string;
}

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label: string;
  description?: string;
  icon: React.ReactNode;
}

function Toggle({ enabled, onChange, label, description, icon }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'p-2 rounded-lg',
            enabled ? 'bg-brand-green/10 text-brand-green' : 'bg-gray-100 text-gray-400'
          )}
        >
          {icon}
        </div>
        <div>
          <p className="font-medium text-brand-dark">{label}</p>
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
      </div>
      <button
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          enabled ? 'bg-brand-green' : 'bg-gray-200'
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            enabled ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );
}

export function NotificationPreferences({
  preferences,
  onChange,
  isPushEnabled = false,
  onEnablePush,
  className = '',
}: NotificationPreferencesProps) {
  const updatePreference = <K extends keyof NotificationPreferencesType>(
    key: K,
    value: NotificationPreferencesType[K]
  ) => {
    onChange({ ...preferences, [key]: value });
  };

  const timeOptions = [
    { value: '07:00', label: '7:00' },
    { value: '08:00', label: '8:00' },
    { value: '09:00', label: '9:00' },
    { value: '10:00', label: '10:00' },
    { value: '18:00', label: '18:00' },
    { value: '19:00', label: '19:00' },
    { value: '20:00', label: '20:00' },
    { value: '21:00', label: '21:00' },
  ];

  return (
    <div className={cn('bg-white rounded-2xl shadow-sm border border-gray-100 p-6', className)}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-brand-green/10 rounded-xl">
          <Bell className="w-6 h-6 text-brand-green" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-brand-dark">Уведомления</h2>
          <p className="text-sm text-gray-500">Настройте напоминания о практике</p>
        </div>
      </div>

      {/* Push Permission Banner */}
      {!isPushEnabled && onEnablePush && (
        <div className="bg-brand-yellow/10 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <BellOff className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">Push-уведомления отключены</p>
              <p className="text-sm text-yellow-700 mt-1">
                Включите уведомления, чтобы не пропускать практики и сохранять streak
              </p>
              <button
                onClick={onEnablePush}
                className="mt-3 px-4 py-2 bg-brand-green text-white text-sm rounded-lg hover:bg-brand-green/90 transition-colors"
              >
                Включить уведомления
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Types */}
      <div className="space-y-1">
        <Toggle
          enabled={preferences.streakReminder}
          onChange={(value) => updatePreference('streakReminder', value)}
          label="Напоминание о streak"
          description="Ежедневное напоминание для поддержания серии"
          icon={<Award className="w-5 h-5" />}
        />

        <Toggle
          enabled={preferences.newContent}
          onChange={(value) => updatePreference('newContent', value)}
          label="Новый контент"
          description="Уведомления о новых видео и практиках"
          icon={<Sparkles className="w-5 h-5" />}
        />

        <Toggle
          enabled={preferences.weeklySummary}
          onChange={(value) => updatePreference('weeklySummary', value)}
          label="Еженедельный итог"
          description="Краткий обзор вашего прогресса за неделю"
          icon={<Calendar className="w-5 h-5" />}
        />

        <Toggle
          enabled={preferences.aiRecommendations}
          onChange={(value) => updatePreference('aiRecommendations', value)}
          label="AI-рекомендации"
          description="Персональные рекомендации от Aria"
          icon={<Sparkles className="w-5 h-5" />}
        />
      </div>

      {/* Reminder Time */}
      {preferences.streakReminder && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-gray-400" />
            <div>
              <p className="font-medium text-brand-dark">Время напоминания</p>
              <p className="text-sm text-gray-500">Когда отправлять напоминание о практике</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {timeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => updatePreference('reminderTime', option.value)}
                className={cn(
                  'py-2 px-3 rounded-lg text-sm font-medium transition-colors',
                  preferences.reminderTime === option.value
                    ? 'bg-brand-green text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <p className="text-xs text-gray-500 text-center">
          Вы можете отключить уведомления в любое время. Мы уважаем ваше время и не будем отправлять
          слишком много сообщений.
        </p>
      </div>
    </div>
  );
}

export default NotificationPreferences;
