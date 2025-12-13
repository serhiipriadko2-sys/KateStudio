
import React from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { FadeIn } from './FadeIn';
import { Image } from './Image';

const articles = [
  {
    id: 1,
    category: "Практика",
    title: "Как начать медитировать: 5 простых шагов",
    excerpt: "Медитация — это не отсутствие мыслей, а умение их наблюдать. Рассказываем, как сделать первые шаги к осознанности без стресса.",
    image: "https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0?q=80&w=800&auto=format&fit=crop",
    date: "12 Авг"
  },
  {
    id: 2,
    category: "Здоровье",
    title: "Питание и Йога: что есть до и после?",
    excerpt: "Легкость в теле — залог успешной практики. Разбираем идеальный рацион для утренних и вечерних занятий.",
    image: "https://images.unsplash.com/photo-1511690656952-34342d5c22b0?q=80&w=800&auto=format&fit=crop",
    date: "08 Авг"
  },
  {
    id: 3,
    category: "Философия",
    title: "Inside Flow: Танец твоего сердца",
    excerpt: "Почему эта практика покоряет мир? Сочетание современной музыки, ритма и традиционных асан в одном потоке.",
    image: "https://images.unsplash.com/photo-1508672019048-805c276e7e69?q=80&w=800&auto=format&fit=crop",
    date: "01 Авг"
  }
];

export const Blog: React.FC = () => {
  return (
    <section id="blog" className="py-24 px-6 md:px-12 max-w-7xl mx-auto scroll-mt-20">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
        <FadeIn>
          <h4 className="text-brand-green tracking-[0.2em] text-xs font-bold uppercase mb-4">Блог</h4>
          <h2 className="text-4xl md:text-6xl font-serif text-brand-text/90">Полезное</h2>
        </FadeIn>
        
        <FadeIn delay={200} direction="left">
          <a href="#" className="flex items-center gap-2 text-brand-text hover:text-brand-green transition-colors group">
            <span className="text-sm font-medium uppercase tracking-wider">Все статьи</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </FadeIn>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {articles.map((article, idx) => (
          <FadeIn key={article.id} delay={idx * 150} direction="up" className="h-full">
            <article className="group h-full flex flex-col cursor-pointer">
              <div className="relative overflow-hidden rounded-[2rem] aspect-[4/3] mb-6 shadow-sm group-hover:shadow-xl transition-all duration-500">
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold text-brand-text z-10">
                  {article.category}
                </div>
                <Image 
                  src={article.image} 
                  alt={article.title}
                  storageKey={`blog-article-${article.id}`}
                  containerClassName="w-full h-full"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-brand-green/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center pointer-events-none">
                   <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-green transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <BookOpen className="w-5 h-5" />
                   </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-3 text-xs text-stone-400 mb-3">
                   <span>{article.date}</span>
                   <span className="w-1 h-1 bg-stone-300 rounded-full"></span>
                   <span>3 мин</span>
                </div>
                <h3 className="text-xl font-serif text-brand-text mb-3 leading-snug group-hover:text-brand-green transition-colors">
                  {article.title}
                </h3>
                <p className="text-stone-500 text-sm leading-relaxed mb-6 line-clamp-3">
                  {article.excerpt}
                </p>
                <div className="mt-auto">
                   <span className="text-xs font-bold uppercase tracking-wider text-brand-green border-b border-brand-green/20 pb-0.5 group-hover:border-brand-green transition-colors">Читать</span>
                </div>
              </div>
            </article>
          </FadeIn>
        ))}
      </div>
    </section>
  );
};
