import { listPublicTrainers } from '@ksebe/shared';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { Link } from 'react-router-dom';
import { getTrainerImageObjectPosition } from './trainerImagePresentation';

export const TrainersPreview: React.FC = () => {
  const { data: trainers = [] } = useQuery({
    queryKey: ['public_trainers_preview'],
    queryFn: listPublicTrainers,
  });

  if (!trainers.length) return null;

  return (
    <section className="bg-stone-50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-green">
            Команда студии
          </p>
          <h2 className="mt-4 text-4xl font-serif text-brand-text md:text-6xl">
            Практику ведут люди, у которых есть собственная глубина и ритм.
          </h2>
          <p className="mt-5 text-base text-stone-500 md:text-lg">
            Познакомьтесь с преподавателями заранее и выберите того, чей голос и подход откликаются
            именно вам.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {trainers.slice(0, 4).map((trainer) => (
            <Link
              key={trainer.id}
              to={`/trainers/${trainer.slug}`}
              className="group overflow-hidden rounded-[2rem] border border-stone-100 bg-white shadow-sm transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="aspect-[4/3] overflow-hidden bg-brand-mint/20">
                {trainer.avatarUrl ? (
                  <img
                    src={trainer.avatarUrl}
                    alt={trainer.fullName}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    style={{ objectPosition: getTrainerImageObjectPosition(trainer.slug) }}
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-7xl font-serif text-brand-green/35">
                    {trainer.fullName.slice(0, 1)}
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-serif text-brand-text">{trainer.fullName}</h3>
                    <p className="mt-1 text-sm text-brand-green">{trainer.roleTitle}</p>
                  </div>
                  {trainer.isFeatured && (
                    <span className="shrink-0 rounded-full bg-brand-mint px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-brand-green">
                      featured
                    </span>
                  )}
                </div>
                <p className="mt-4 text-stone-500">{trainer.bioShort}</p>
                {trainer.specialties.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {trainer.specialties.slice(0, 3).map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-500"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
