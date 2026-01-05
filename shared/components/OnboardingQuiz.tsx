import { ChevronRight, ChevronLeft, Sparkles, Check } from 'lucide-react';
import React, { useState, useCallback } from 'react';
import type { PracticeGoal, PracticeLevel, OnboardingData } from '../types';
import { cn } from '../utils';

export interface OnboardingQuizProps {
  onComplete: (data: OnboardingData) => void;
  onSkip?: () => void;
  className?: string;
}

interface QuizStep {
  id: string;
  title: string;
  subtitle: string;
  type: 'single' | 'multi' | 'slider';
  options?: { value: string; label: string; icon: string; description?: string }[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

const QUIZ_STEPS: QuizStep[] = [
  {
    id: 'goals',
    title: 'Какие у вас цели?',
    subtitle: 'Выберите одну или несколько целей',
    type: 'multi',
    options: [
      { value: 'flexibility', label: 'Гибкость', icon: '🧘', description: 'Растяжка и пластика' },
      { value: 'strength', label: 'Сила', icon: '💪', description: 'Укрепление мышц' },
      { value: 'relaxation', label: 'Расслабление', icon: '🕊️', description: 'Снятие стресса' },
      { value: 'energy', label: 'Энергия', icon: '⚡', description: 'Бодрость и тонус' },
      { value: 'balance', label: 'Баланс', icon: '⚖️', description: 'Равновесие тела и ума' },
    ],
  },
  {
    id: 'level',
    title: 'Ваш уровень опыта?',
    subtitle: 'Это поможет подобрать практики',
    type: 'single',
    options: [
      {
        value: 'beginner',
        label: 'Начинающий',
        icon: '🌱',
        description: 'Новичок в йоге или меньше года практики',
      },
      {
        value: 'intermediate',
        label: 'Средний',
        icon: '🌿',
        description: '1-3 года регулярной практики',
      },
      {
        value: 'advanced',
        label: 'Продвинутый',
        icon: '🌳',
        description: 'Более 3 лет практики',
      },
    ],
  },
  {
    id: 'duration',
    title: 'Сколько времени у вас есть?',
    subtitle: 'Предпочтительная длительность практики',
    type: 'slider',
    min: 10,
    max: 60,
    step: 5,
    unit: 'мин',
  },
  {
    id: 'time',
    title: 'Когда вы предпочитаете практиковать?',
    subtitle: 'Мы будем напоминать в удобное время',
    type: 'single',
    options: [
      { value: 'morning', label: 'Утром', icon: '🌅', description: '6:00 - 11:00' },
      { value: 'afternoon', label: 'Днём', icon: '☀️', description: '11:00 - 17:00' },
      { value: 'evening', label: 'Вечером', icon: '🌙', description: '17:00 - 22:00' },
      { value: 'flexible', label: 'Гибко', icon: '🔄', description: 'Когда есть время' },
    ],
  },
];

export function OnboardingQuiz({ onComplete, onSkip, className = '' }: OnboardingQuizProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[] | number>>({
    goals: [],
    level: '',
    duration: 30,
    time: '',
  });

  const step = QUIZ_STEPS[currentStep];
  const isLastStep = currentStep === QUIZ_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const canProceed = useCallback(() => {
    const answer = answers[step.id];
    if (step.type === 'multi') {
      return Array.isArray(answer) && answer.length > 0;
    }
    if (step.type === 'single') {
      return typeof answer === 'string' && answer.length > 0;
    }
    return true; // slider always has a value
  }, [answers, step]);

  const handleSingleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [step.id]: value }));
  };

  const handleMultiSelect = (value: string) => {
    setAnswers((prev) => {
      const current = prev[step.id] as string[];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [step.id]: updated };
    });
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswers((prev) => ({ ...prev, [step.id]: parseInt(e.target.value) }));
  };

  const handleNext = () => {
    if (isLastStep) {
      const data: OnboardingData = {
        goals: answers.goals as PracticeGoal[],
        level: answers.level as PracticeLevel,
        preferredDuration: answers.duration as number,
        preferredTime: answers.time as OnboardingData['preferredTime'],
        completedAt: new Date().toISOString(),
      };
      onComplete(data);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  return (
    <div className={cn('bg-white rounded-2xl shadow-xl overflow-hidden', className)}>
      {/* Progress Bar */}
      <div className="h-1 bg-gray-100">
        <div
          className="h-full bg-brand-green transition-all duration-300"
          style={{ width: `${((currentStep + 1) / QUIZ_STEPS.length) * 100}%` }}
        />
      </div>

      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-brand-green" />
          </div>
          <h2 className="text-xl font-bold text-brand-dark mb-2">{step.title}</h2>
          <p className="text-gray-500 text-sm">{step.subtitle}</p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {step.type === 'single' &&
            step.options?.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSingleSelect(option.value)}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all',
                  answers[step.id] === option.value
                    ? 'border-brand-green bg-brand-green/5'
                    : 'border-gray-200 hover:border-brand-green/50'
                )}
              >
                <span className="text-2xl">{option.icon}</span>
                <div className="flex-1 text-left">
                  <p className="font-medium text-brand-dark">{option.label}</p>
                  {option.description && (
                    <p className="text-sm text-gray-500">{option.description}</p>
                  )}
                </div>
                {answers[step.id] === option.value && (
                  <Check className="w-5 h-5 text-brand-green" />
                )}
              </button>
            ))}

          {step.type === 'multi' &&
            step.options?.map((option) => {
              const selected = (answers[step.id] as string[]).includes(option.value);
              return (
                <button
                  key={option.value}
                  onClick={() => handleMultiSelect(option.value)}
                  className={cn(
                    'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all',
                    selected
                      ? 'border-brand-green bg-brand-green/5'
                      : 'border-gray-200 hover:border-brand-green/50'
                  )}
                >
                  <span className="text-2xl">{option.icon}</span>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-brand-dark">{option.label}</p>
                    {option.description && (
                      <p className="text-sm text-gray-500">{option.description}</p>
                    )}
                  </div>
                  <div
                    className={cn(
                      'w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all',
                      selected ? 'border-brand-green bg-brand-green' : 'border-gray-300'
                    )}
                  >
                    {selected && <Check className="w-4 h-4 text-white" />}
                  </div>
                </button>
              );
            })}

          {step.type === 'slider' && (
            <div className="py-8">
              <div className="text-center mb-8">
                <span className="text-5xl font-bold text-brand-green">{answers[step.id]}</span>
                <span className="text-2xl text-gray-500 ml-2">{step.unit}</span>
              </div>
              <input
                type="range"
                min={step.min}
                max={step.max}
                step={step.step}
                value={answers[step.id] as number}
                onChange={handleSliderChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-green"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>
                  {step.min} {step.unit}
                </span>
                <span>
                  {step.max} {step.unit}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {!isFirstStep && (
            <button
              onClick={handleBack}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Назад
            </button>
          )}

          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-colors',
              canProceed()
                ? 'bg-brand-green text-white hover:bg-brand-green/90'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            )}
          >
            {isLastStep ? 'Завершить' : 'Далее'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Skip */}
        {onSkip && (
          <button
            onClick={onSkip}
            className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Пропустить настройку
          </button>
        )}
      </div>
    </div>
  );
}

export default OnboardingQuiz;
