export type ContentMode = 'demo' | 'production';

export interface ScheduleTemplate {
  name: string;
  time: string;
  duration: string;
  spotsTotal: number;
  location: string;
  intensity: 1 | 2 | 3;
}

export interface ScheduleContent {
  offline: ScheduleTemplate[];
  online: ScheduleTemplate[];
}

export interface GalleryMediaItem {
  id: number;
  url: string;
  alt: string;
  wrapperClassName?: string;
  imageClassName?: string;
}

export interface BlogArticle {
  id: number;
  category: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  content: string;
}

export interface ContentData {
  schedule: ScheduleContent;
  gallery: GalleryMediaItem[];
  articles: BlogArticle[];
}

export const defaultContent: ContentData = {
  schedule: {
    offline: [
      {
        name: 'Inside Flow',
        time: '09:00',
        duration: '90 мин',
        spotsTotal: 12,
        location: 'Зал на Мира',
        intensity: 3,
      },
      {
        name: 'Хатха Йога',
        time: '18:30',
        duration: '60 мин',
        spotsTotal: 15,
        location: 'Зал на Ленина',
        intensity: 2,
      },
      {
        name: 'Медитация + Sound Healing',
        time: '20:00',
        duration: '60 мин',
        spotsTotal: 10,
        location: 'Зал на Мира',
        intensity: 1,
      },
    ],
    online: [
      {
        name: 'Утренний поток (Zoom)',
        time: '08:00',
        duration: '45 мин',
        spotsTotal: 50,
        location: 'Online',
        intensity: 2,
      },
      {
        name: 'Вечерняя растяжка (Zoom)',
        time: '19:00',
        duration: '60 мин',
        spotsTotal: 50,
        location: 'Online',
        intensity: 1,
      },
    ],
  },
  gallery: [
    {
      id: 1,
      url: '/images/gallery/gallery-image-1.jpg',
      alt: 'Meditation Atmosphere',
      wrapperClassName: 'md:col-span-1 row-span-1',
    },
    {
      id: 2,
      url: '/images/gallery/gallery-image-2.jpg',
      alt: 'Stretching Flow',
      wrapperClassName: 'md:col-span-2 row-span-1',
      imageClassName: 'object-[50%_40%]',
    },
    {
      id: 3,
      url: '/images/gallery/gallery-image-3.jpg',
      alt: 'Yoga Studio Vibe',
      wrapperClassName: 'md:col-span-2 row-span-1',
    },
    {
      id: 4,
      url: '/images/gallery/gallery-image-4.jpg',
      alt: 'Peaceful Moment',
      wrapperClassName: 'md:col-span-1 row-span-1',
    },
  ],
  articles: [
    {
      id: 1,
      category: 'Практика',
      title: 'Как начать медитировать: 5 простых шагов',
      excerpt:
        'Медитация — это не отсутствие мыслей, а умение их наблюдать. Рассказываем, как сделать первые шаги к осознанности без стресса.',
      image:
        'https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0?q=80&w=800&auto=format&fit=crop',
      date: '12 Авг',
      content: `
      <p>Многие думают, что медитация — это сидеть в позе лотоса и ни о чем не думать. На самом деле, это тренировка ума возвращаться в настоящий момент.</p>
      <h3>1. Найдите удобное место</h3>
      <p>Вам не нужна специальная комната. Достаточно тихого уголка и подушки. Главное — прямая спина.</p>
      <h3>2. Начните с дыхания</h3>
      <p>Просто наблюдайте за тем, как воздух входит и выходит. Не пытайтесь его контролировать.</p>
      <h3>3. Не ругайте себя за мысли</h3>
      <p>Мысли будут приходить. Это нормально. Как только заметите, что отвлеклись — мягко верните внимание к дыханию.</p>
      <p>Начните с 5 минут в день. Это эффективнее, чем час раз в месяц.</p>
    `,
    },
    {
      id: 2,
      category: 'Здоровье',
      title: 'Питание и Йога: что есть до и после?',
      excerpt:
        'Легкость в теле — залог успешной практики. Разбираем идеальный рацион для утренних и вечерних занятий.',
      image:
        'https://images.unsplash.com/photo-1511690656952-34342d5c22b0?q=80&w=800&auto=format&fit=crop',
      date: '08 Авг',
      content: `
      <p>Йога на полный желудок — это испытание. Но и на голодный желудок заниматься сложно из-за слабости.</p>
      <h3>До практики (за 1.5-2 часа)</h3>
      <p>Идеально подойдут легкие углеводы: банан, овсянка на воде, смузи. Избегайте тяжелой, жирной пищи.</p>
      <h3>После практики</h3>
      <p>В течение 30 минут после шавасаны лучше выпить травяной чай или воду. Через час можно полноценно поесть: белок + овощи.</p>
      <p>Слушайте свое тело — оно лучший нутрициолог.</p>
    `,
    },
    {
      id: 3,
      category: 'Философия',
      title: 'Inside Flow: Танец твоего сердца',
      excerpt:
        'Почему эта практика покоряет мир? Сочетание современной музыки, ритма и традиционных асан в одном потоке.',
      image:
        'https://images.unsplash.com/photo-1508672019048-805c276e7e69?q=80&w=800&auto=format&fit=crop',
      date: '01 Авг',
      content: `
      <p>Inside Flow — это эволюция виньяса-йоги. Здесь мы движемся в такт современной музыке.</p>
      <h3>Музыка как проводник</h3>
      <p>Каждое движение синхронизировано с битом. Это помогает отключить "мыслемешалку" и полностью отдаться потоку.</p>
      <h3>История в движении</h3>
      <p>Каждая последовательность (флоу) рассказывает историю. Мы проживаем эмоции через тело.</p>
      <p>Это практика для тех, кто любит динамику, музыку и хочет почувствовать йогу по-новому.</p>
    `,
    },
  ],
};
