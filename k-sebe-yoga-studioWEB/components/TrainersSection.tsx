import { listPublicTrainers } from '@ksebe/shared';
import type { TrainerCard } from '@ksebe/shared';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

type TrainersSectionProps = {
  onOpenTrainer?: (slug: string) => void;
};

const fallbackTrainers: TrainerCard[] = [
  {
    id: 'elizaveta-belonogova',
    slug: 'elizaveta-belonogova',
    fullName: 'Елизавета Белоногова',
    roleTitle: 'Smart Stretching',
    bioShort:
      'Специалист по физической реабилитации с 10-летним опытом. Ведет умную растяжку и практики для здорового позвоночника.',
    avatarUrl: null,
    specialties: ['Smart Stretching', 'здоровый позвоночник', 'мягкая растяжка'],
    isFeatured: true,
  },
  {
    id: 'lidia-kuzina',
    slug: 'lidia-kuzina',
    fullName: 'Лидия Кузина',
    roleTitle: 'Хатха-йога и виньяса-флоу',
    bioShort:
      'Сертифицированный мастер хатха-йоги и виньяса-флоу с более чем 10-летним опытом личной практики.',
    avatarUrl: null,
    specialties: ['хатха-йога', 'виньяса-флоу', 'пранаяма'],
    isFeatured: true,
  },
];

export const TrainersSection = ({ onOpenTrainer }: TrainersSectionProps) => {
  const [trainers, setTrainers] = useState<TrainerCard[]>(fallbackTrainers);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    listPublicTrainers()
      .then((items) => {
        if (!mounted) return;
        setTrainers(items.length > 0 ? items : fallbackTrainers);
      })
      .catch((error) => {
        console.warn('Failed to load trainers, using fallback content', error);
        if (mounted) setTrainers(fallbackTrainers);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section id="trainers" className="relative py-24 md:py-32 bg-[#FDFBF7] overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-mint/60 to-transparent" />
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-mint/40 text-brand-green text-xs font-bold uppercase tracking-[0.24em] mb-6">
            <Sparkles className="w-4 h-4" />
            Команда студии
          </div>
          <h2 className="text-4xl md:text-6xl font-serif text-brand-text leading-tight mb-6">
            Пространство держат люди
          </h2>
          <p className="text-lg md:text-xl text-stone-500 font-light leading-relaxed">
            Познакомьтесь с проводниками студии «К себе»: каждый преподаватель бережно сопровождает вас в практике, движении и возвращении к телу.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {trainers.map((trainer) => (
            <article
              key={trainer.slug}
              className="group bg-white rounded-[2rem] border border-stone-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <div className="aspect-[4/3] bg-brand-mint/30 relative overflow-hidden">
                {trainer.avatarUrl ? (
                  <img
                    src={trainer.avatarUrl}
                    alt={trainer.fullName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-7xl font-serif text-brand-green/40">
                    {trainer.fullName.slice(0, 1)}
                  </div>
                )}
              </div>

              <div className="p-7 md:p-8">
                <p className="text-sm uppercase tracking-[0.2em] text-brand-green font-semibold mb-3">
                  {trainer.roleTitle}
                </p>
                <h3 className="text-3xl font-serif text-brand-text mb-4">{trainer.fullName}</h3>
                <p className="text-stone-500 leading-relaxed mb-6">{trainer.bioShort}</p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {trainer.specialties.slice(0, 4).map((specialty) => (
                    <span
                      key={specialty}
                      className="px-3 py-1 rounded-full bg-stone-50 text-stone-500 text-xs font-medium"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => onOpenTrainer?.(trainer.slug)}
                  className="inline-flex items-center gap-2 text-brand-green font-semibold hover:gap-3 transition-all"
                  disabled={!onOpenTrainer || isLoading}
                >
                  Подробнее <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
