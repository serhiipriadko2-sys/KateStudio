import { listPublicTrainers } from '@ksebe/shared';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { Link } from 'react-router-dom';

export const TrainersPreview: React.FC = () => {
  const { data: trainers = [] } = useQuery({
    queryKey: ['public_trainers_preview'],
    queryFn: listPublicTrainers,
  });

  if (!trainers.length) return null;

  return (
    <section className="py-24 bg-stone-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-green">
            Команда студии
          </p>
          <h2 className="mt-4 text-4xl md:text-6xl font-serif text-brand-text">
            Практику ведут люди, у которых есть собственная глубина и ритм.
          </h2>
          <p className="mt-5 text-base md:text-lg text-stone-500">
            Познакомьтесь с преподавателями заранее и выберите того, чей голос и подход
            откликаются именно вам.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-10">
          {trainers.slice(0, 4).map((trainer) => (
            <Link
              key={trainer.id}
              to={`/trainers/${trainer.slug}`}
              className="bg-white rounded-[2rem] p-6 border border-stone-100 shadow-sm transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-serif text-brand-text">{trainer.fullName}</h3>
                  <p className="text-brand-green text-sm mt-1">{trainer.roleTitle}</p>
                </div>
                {trainer.isFeatured && (
                  <span className="shrink-0 rounded-full bg-brand-mint px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-brand-green">
                    featured
                  </span>
                )}
              </div>
              <p className="text-stone-500 mt-4">{trainer.bioShort}</p>
              {trainer.specialties.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
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
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <Link
            to="/trainers"
            className="inline-flex items-center rounded-full border border-brand-green px-6 py-3 text-sm font-medium text-brand-green transition-colors hover:bg-brand-green hover:text-white"
          >
            Смотреть всех тренеров
          </Link>
        </div>
      </div>
    </section>
  );
};