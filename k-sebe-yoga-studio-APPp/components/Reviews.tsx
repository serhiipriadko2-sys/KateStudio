import { IMAGES } from '@ksebe/shared';
import { Star } from 'lucide-react';
import React from 'react';
import { Image } from './Image';

const reviews = [
  {
    id: 1,
    name: 'Анна М.',
    role: 'Постоянный клиент',
    text: 'Невероятная атмосфера и профессиональные преподаватели. Inside Flow изменил мое представление о йоге!',
    image: IMAGES.reviews.avatars[0],
    rating: 5,
  },
  {
    id: 2,
    name: 'Мария К.',
    role: 'Новичок',
    text: 'Очень боялась идти первый раз, но Катя создала такое безопасное пространство, что страх сразу ушел.',
    image: IMAGES.reviews.avatars[1],
    rating: 5,
  },
  {
    id: 3,
    name: 'Елена В.',
    role: 'Практикует 3 года',
    text: 'Студия очень стильная и уютная. Каждая деталь продумана с любовью. Рекомендую всем!',
    image: IMAGES.reviews.avatars[2],
    rating: 5,
  },
  {
    id: 4,
    name: 'Ольга С.',
    role: 'Любит медитации',
    text: 'Медитации с поющими чашами — это космос. Полное перезагрузка за час.',
    image: IMAGES.reviews.avatars[3],
    rating: 5,
  },
  {
    id: 5,
    name: 'Татьяна П.',
    role: 'Inside Flow фанат',
    text: 'Музыка, движения, дыхание... Это больше чем спорт, это искусство. Спасибо за вдохновение!',
    image: IMAGES.reviews.avatars[4],
    rating: 5,
  },
];

export const Reviews: React.FC = () => {
  return (
    <section className="py-12 bg-stone-50">
      <div className="px-6 mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-green mb-2 block">
          Отзывы
        </span>
        <h2 className="text-3xl font-serif text-brand-text">Что говорят гости</h2>
      </div>

      <div className="flex overflow-x-auto px-6 gap-4 pb-8 scrollbar-hide snap-x">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="min-w-[300px] bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100 snap-center"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-stone-100">
                <Image
                  src={review.image}
                  alt={review.name}
                  storageKey={`review-avatar-${review.id}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-serif text-brand-text">{review.name}</h4>
                <p className="text-xs text-stone-400">{review.role}</p>
              </div>
            </div>
            <div className="flex gap-1 mb-3">
              {[...Array(review.rating)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-brand-yellow text-brand-yellow" />
              ))}
            </div>
            <p className="text-sm text-stone-600 leading-relaxed font-light">"{review.text}"</p>
          </div>
        ))}
      </div>
    </section>
  );
};
