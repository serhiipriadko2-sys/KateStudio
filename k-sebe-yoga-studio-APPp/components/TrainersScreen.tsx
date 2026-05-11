import { getTrainerBySlug, listClassesByTrainer, listPublicTrainers } from '@ksebe/shared';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import type { ClassSession } from '../types';
import { BookingModal } from './BookingModal';
import {
  getTrainerGalleryImageObjectPosition,
  getTrainerImageObjectPosition,
} from './trainerImagePresentation';

export const TrainersScreen: React.FC = () => {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassSession | null>(null);

  const { data: trainers = [], isLoading } = useQuery({
    queryKey: ['app_trainers'],
    queryFn: listPublicTrainers,
  });

  const { data: trainer } = useQuery({
    queryKey: ['app_trainer_detail', activeSlug],
    queryFn: () => getTrainerBySlug(activeSlug!),
    enabled: !!activeSlug,
  });

  const { data: classes = [], refetch: refetchClasses } = useQuery({
    queryKey: ['app_trainer_classes', trainer?.id],
    queryFn: () => listClassesByTrainer(trainer!.id),
    enabled: !!trainer?.id,
  });

  const openBooking = (item: (typeof classes)[number]) => {
    if (!trainer || !item.date || !item.time) return;

    const normalizedIntensity = [1, 2, 3].includes(item.intensity ?? 0)
      ? (item.intensity as 1 | 2 | 3)
      : 2;

    setSelectedClass({
      id: item.id,
      dateStr: item.date,
      time: item.time,
      name: item.title,
      instructor: item.instructor ?? trainer.fullName,
      duration: item.duration ?? '60 мин',
      spotsTotal: item.spotsTotal ?? 12,
      spotsBooked: item.spotsBooked ?? 0,
      location: item.location ?? 'Станционная ул., 5Б',
      intensity: normalizedIntensity,
      price: item.price ?? 700,
      isOnline: item.isOnline ?? false,
    });
  };

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
                type="button"
                onClick={() => setActiveSlug(item.slug)}
                className="bg-white text-left rounded-[2rem] border border-stone-100 shadow-sm transition-transform duration-300 hover:-translate-y-1 overflow-hidden"
              >
                {item.avatarUrl && (
                  <div className="aspect-[16/7] overflow-hidden bg-stone-100">
                    <img
                      src={item.avatarUrl}
                      alt={item.fullName}
                      className="h-full w-full object-cover"
                      style={{ objectPosition: getTrainerImageObjectPosition(item.slug) }}
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="text-xl font-serif text-brand-text">{item.fullName}</div>
                  <div className="text-sm text-brand-green mt-1">{item.roleTitle}</div>
                  <div className="text-sm text-stone-500 mt-3">{item.bioShort}</div>
                </div>
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
            {trainer.coverImageUrl && (
              <div className="-mx-2 -mt-2 mb-5 aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-stone-100">
                <img
                  src={trainer.coverImageUrl}
                  alt={trainer.fullName}
                  className="h-full w-full object-cover"
                  style={{ objectPosition: getTrainerImageObjectPosition(trainer.slug) }}
                  loading="lazy"
                />
              </div>
            )}
            <h2 className="text-3xl font-serif text-brand-text">{trainer.fullName}</h2>
            <p className="text-brand-green mt-2">{trainer.roleTitle}</p>
            {trainer.quote && <p className="italic text-stone-500 mt-4">{trainer.quote}</p>}
            {trainer.bioLong && <p className="text-stone-600 mt-4">{trainer.bioLong}</p>}
            {trainer.galleryImageUrls.length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-3">
                {trainer.galleryImageUrls.slice(0, 2).map((url, index) => (
                  <div key={url} className="aspect-square overflow-hidden rounded-2xl bg-stone-100">
                    <img
                      src={url}
                      alt={`${trainer.fullName}, фото ${index + 1}`}
                      className="h-full w-full object-cover"
                      style={{
                        objectPosition: getTrainerGalleryImageObjectPosition(trainer.slug, index),
                      }}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            {classes.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openBooking(item)}
                className="w-full text-left bg-white rounded-2xl p-4 border border-stone-100 transition-colors hover:border-brand-green/30 hover:shadow-sm"
              >
                <div className="font-medium text-brand-text">{item.title}</div>
                <div className="text-sm text-stone-500 mt-1">
                  {item.date} · {item.time}
                </div>
                <div className="mt-3 text-sm font-medium text-brand-green">Записаться</div>
              </button>
            ))}
            {!classes.length && (
              <div className="text-sm text-stone-400">Ближайших занятий пока нет.</div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-stone-400">Профиль тренера не найден.</div>
      )}

      {selectedClass && (
        <BookingModal
          isOpen={true}
          onClose={() => setSelectedClass(null)}
          classDetails={selectedClass}
          onSuccess={() => void refetchClasses()}
        />
      )}
    </div>
  );
};
