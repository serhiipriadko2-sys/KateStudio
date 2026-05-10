import { getTrainerBySlug, listClassesByTrainer, listPublicTrainers } from '@ksebe/shared';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';

export const TrainersScreen: React.FC = () => {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const { data: trainers = [], isLoading } = useQuery({
    queryKey: ['app_trainers'],
    queryFn: listPublicTrainers,
  });
  const { data: trainer } = useQuery({
    queryKey: ['app_trainer_detail', activeSlug],
    queryFn: () => getTrainerBySlug(activeSlug!),
    enabled: !!activeSlug,
  });
  const { data: classes = [] } = useQuery({
    queryKey: ['app_trainer_classes', trainer?.id],
    queryFn: () => listClassesByTrainer(trainer!.id),
    enabled: !!trainer?.id,
  });

  if (isLoading) {
    return <div className="max-w-3xl mx-auto text-stone-400">Загрузка тренеров...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      {!activeSlug ? (
        <div className="space-y-6">
          <header>
            <h1 className="text-2xl md:text-3xl font-serif text-brand-text">Тренеры</h1>
            <p className="text-stone-400 font-light text-sm mt-1">
              Выберите преподавателя и посмотрите ближайшие занятия.
            </p>
          </header>

          <div className="grid gap-4">
            {trainers.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSlug(item.slug)}
                className="bg-white text-left rounded-[2rem] p-5 border border-stone-100 shadow-sm transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="text-xl font-serif text-brand-text">{item.fullName}</div>
                <div className="text-sm text-brand-green mt-1">{item.roleTitle}</div>
                <div className="text-sm text-stone-500 mt-3">{item.bioShort}</div>
              </button>
            ))}
          </div>
        </div>
      ) : trainer ? (
        <div className="space-y-6">
          <button onClick={() => setActiveSlug(null)} className="text-sm text-brand-green">
            Назад к списку
          </button>

          <div className="bg-white rounded-[2rem] p-6 border border-stone-100 shadow-sm">
            <h2 className="text-3xl font-serif text-brand-text">{trainer.fullName}</h2>
            <p className="text-brand-green mt-2">{trainer.roleTitle}</p>
            {trainer.quote && <p className="italic text-stone-500 mt-4">{trainer.quote}</p>}
            {trainer.bioLong && <p className="text-stone-600 mt-4">{trainer.bioLong}</p>}
          </div>

          <div className="space-y-3">
            {classes.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-4 border border-stone-100">
                <div className="font-medium text-brand-text">{item.title}</div>
                <div className="text-sm text-stone-500 mt-1">
                  {item.date} · {item.time}
                </div>
              </div>
            ))}
            {!classes.length && (
              <div className="text-sm text-stone-400">Ближайших занятий пока нет.</div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-stone-400">Профиль тренера не найден.</div>
      )}
    </div>
  );
};