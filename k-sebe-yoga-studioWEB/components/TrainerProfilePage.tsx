import { getTrainerBySlug, listClassesByTrainer } from '@ksebe/shared';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { SEO } from './SEO';
import {
  getTrainerGalleryImageObjectPosition,
  getTrainerImageObjectPosition,
} from './trainerImagePresentation';

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

  const heroImage = trainer.coverImageUrl ?? trainer.avatarUrl;

  return (
    <>
      <SEO
        title={`${trainer.fullName} — ${trainer.roleTitle}`}
        description={trainer.bioShort}
        url={`/trainers/${trainer.slug}`}
      />
      <main className="min-h-screen bg-brand-light px-6 py-24 md:py-32">
        <div className="max-w-5xl mx-auto">
          <Link to="/trainers" className="inline-block text-sm text-brand-green">
            Ко всем тренерам
          </Link>

          <div className="mt-6 overflow-hidden rounded-[2.5rem] border border-stone-100 bg-white shadow-sm">
            {heroImage && (
              <div className="relative aspect-[16/8] overflow-hidden bg-brand-mint/20">
                <img
                  src={heroImage}
                  alt={trainer.fullName}
                  className="h-full w-full object-cover"
                  style={{ objectPosition: getTrainerImageObjectPosition(trainer.slug) }}
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
              </div>
            )}

            <div className="px-8 py-10 md:px-12 md:py-14">
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-green">
                    Профиль тренера
                  </p>
                  <h1 className="mt-4 text-4xl font-serif text-brand-text md:text-6xl">
                    {trainer.fullName}
                  </h1>
                  <p className="mt-3 text-brand-green">{trainer.roleTitle}</p>
                </div>

                {trainer.avatarUrl && (
                  <div className="h-28 w-28 shrink-0 overflow-hidden rounded-[2rem] border border-white/70 bg-stone-100 shadow-md md:h-32 md:w-32 md:-mt-20">
                    <img
                      src={trainer.avatarUrl}
                      alt={trainer.fullName}
                      className="h-full w-full object-cover"
                      style={{ objectPosition: getTrainerImageObjectPosition(trainer.slug) }}
                      loading="lazy"
                    />
                  </div>
                )}
              </div>

              {trainer.quote && (
                <p className="mt-6 text-lg italic leading-relaxed text-stone-500">
                  {trainer.quote}
                </p>
              )}
              {trainer.bioLong && (
                <p className="mt-8 whitespace-pre-line leading-8 text-stone-600">
                  {trainer.bioLong}
                </p>
              )}

              <div className="mt-8 flex flex-wrap gap-2">
                {trainer.specialties.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-500"
                  >
                    {item}
                  </span>
                ))}
              </div>

              {trainer.galleryImageUrls.length > 0 && (
                <div className="mt-10 grid gap-3 md:grid-cols-2">
                  {trainer.galleryImageUrls.slice(0, 2).map((url, index) => (
                    <div
                      key={url}
                      className="aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-stone-100"
                    >
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
          </div>

          <section className="mt-12">
            <h2 className="text-2xl font-serif text-brand-text md:text-3xl">Ближайшие занятия</h2>
            {classes.length ? (
              <div className="mt-4 grid gap-3">
                {classes.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-stone-100 bg-white p-4">
                    <div className="font-medium text-brand-text">{item.title}</div>
                    <div className="mt-1 text-sm text-stone-500">
                      {item.date} · {item.time}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-stone-500">
                Ближайшие занятия пока не опубликованы, но профиль уже активен.
              </p>
            )}
          </section>
        </div>
      </main>
    </>
  );
};
