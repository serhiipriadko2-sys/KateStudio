import { listPublicTrainers } from '@ksebe/shared';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from './SEO';

export const TrainersPage: React.FC = () => {
  const { data: trainers = [], isLoading } = useQuery({
    queryKey: ['public_trainers_page'],
    queryFn: listPublicTrainers,
  });

  return (
    <>
      <SEO
        title="Тренеры студии"
        description="Тренеры студии «К себе»: направления, подход и ближайшие занятия."
        url="/trainers"
      />
      <main className="min-h-screen bg-brand-light px-6 py-24 md:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-green">
              Тренеры
            </p>
            <h1 className="mt-4 text-4xl md:text-6xl font-serif text-brand-text">
              У каждого преподавателя здесь свой язык тела, внимания и темпа.
            </h1>
            <p className="mt-5 text-base md:text-lg text-stone-500">
              Можно прийти на практику вслепую. Но лучше заранее почувствовать, кто перед вами.
            </p>
          </div>

          {isLoading ? (
            <div className="mt-10 text-stone-400">Загрузка тренеров...</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 mt-10">
              {trainers.map((trainer) => (
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
                        <h2 className="text-2xl font-serif text-brand-text">{trainer.fullName}</h2>
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
                        {trainer.specialties.map((item) => (
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
          )}
        </div>
      </main>
    </>
  );
};