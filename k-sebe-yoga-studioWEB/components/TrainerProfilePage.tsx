import { getTrainerBySlug, listClassesByTrainer } from '@ksebe/shared';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { SEO } from './SEO';

export const TrainerProfilePage: React.FC = () => {
  const { slug = '' } = useParams();
  const { data: trainer, isLoading } = useQuery({
    queryKey: ['trainer_detail', slug],
    queryFn: () => getTrainerBySlug(slug),
    enabled: !!slug,
  });
  const { data: classes = [] } = useQuery({
    queryKey: ['trainer_classes', trainer?.id],
    queryFn: () => listClassesByTrainer(trainer!.id),
    enabled: !!trainer?.id,
  });

  if (isLoading) {
    return <main className="min-h-screen bg-brand-light px-6 py-24">Загрузка...</main>;
  }

  if (!trainer) {
    return (
      <main className="min-h-screen bg-brand-light px-6 py-24">
        <div className="max-w-3xl mx-auto">
          <p className="text-stone-500">Профиль тренера не найден.</p>
          <Link to="/trainers" className="inline-block mt-4 text-brand-green">
            Вернуться к списку тренеров
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <SEO
        title={`${trainer.fullName} — ${trainer.roleTitle}`}
        description={trainer.bioShort}
        url={`/trainers/${trainer.slug}`}
      />
      <main className="min-h-screen bg-brand-light px-6 py-24 md:py-32">
        <div className="max-w-4xl mx-auto">
          <Link to="/trainers" className="inline-block text-sm text-brand-green">
            Ко всем тренерам
          </Link>

          <div className="mt-6 bg-white rounded-[2.5rem] border border-stone-100 shadow-sm overflow-hidden">
            <div className="px-8 py-10 md:px-12 md:py-14">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-green">
                Профиль тренера
              </p>
              <h1 className="mt-4 text-4xl md:text-6xl font-serif text-brand-text">
                {trainer.fullName}
              </h1>
              <p className="text-brand-green mt-3">{trainer.roleTitle}</p>
              {trainer.quote && (
                <p className="italic text-stone-500 mt-6 text-lg leading-relaxed">
                  {trainer.quote}
                </p>
              )}
              {trainer.bioLong && (
                <p className="text-stone-600 mt-8 whitespace-pre-line leading-8">
                  {trainer.bioLong}
                </p>
              )}

              <div className="flex flex-wrap gap-2 mt-8">
                {trainer.specialties.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-500"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <section className="mt-12">
            <h2 className="text-2xl md:text-3xl font-serif text-brand-text">Ближайшие занятия</h2>
            {classes.length ? (
              <div className="grid gap-3 mt-4">
                {classes.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl p-4 border border-stone-100">
                    <div className="font-medium text-brand-text">{item.title}</div>
                    <div className="text-sm text-stone-500 mt-1">
                      {item.date} · {item.time}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-stone-500 mt-4">
                Ближайшие занятия пока не опубликованы, но профиль уже активен.
              </p>
            )}
          </section>
        </div>
      </main>
    </>
  );
};