/* eslint-disable jsx-a11y/no-static-element-interactions */
import { IMAGES } from '@ksebe/shared';
import { ArrowRight, Calendar, ChevronRight, User } from 'lucide-react';
import React, { useState } from 'react';
import { Image } from './Image';

interface Article {
  id: string;
  title: string;
  category: string;
  image: string;
  date: string;
  readTime: string;
  author: string;
}

const articles: Article[] = [
  {
    id: '1',
    title: 'Как начать медитировать: 5 простых шагов',
    category: 'Медитация',
    image: IMAGES.blog.articles[0],
    date: '12 фев 2026',
    readTime: '5 мин',
    author: 'Катя Габран',
  },
  {
    id: '2',
    title: 'Польза утренней йоги для организма',
    category: 'Здоровье',
    image: IMAGES.blog.articles[1],
    date: '10 фев 2026',
    readTime: '7 мин',
    author: 'Катя Габран',
  },
  {
    id: '3',
    title: 'Inside Flow: Танец вашего дыхания',
    category: 'Inside Flow',
    image: IMAGES.blog.articles[2],
    date: '8 фев 2026',
    readTime: '6 мин',
    author: 'Катя Габран',
  },
];

export const Blog: React.FC = () => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  return (
    <section className="py-12 bg-white rounded-[3rem] -mt-12 relative z-10">
      <div className="px-6 mb-8 flex justify-between items-end">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-green mb-2 block">
            Блог
          </span>
          <h2 className="text-3xl font-serif text-brand-text">Статьи</h2>
        </div>
        <button className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center hover:bg-brand-mint hover:border-brand-green transition-colors group">
          <ArrowRight className="w-5 h-5 text-stone-400 group-hover:text-brand-green transition-colors" />
        </button>
      </div>

      <div className="flex overflow-x-auto px-6 gap-4 pb-8 scrollbar-hide snap-x">
        {articles.map((article) => (
          <div
            key={article.id}
            role="button"
            tabIndex={0}
            onClick={() => setSelectedArticle(article)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectedArticle(article);
              }
            }}
            className="min-w-[280px] snap-center group cursor-pointer"
          >
            <div className="relative h-48 rounded-[2rem] overflow-hidden mb-4">
              <Image
                src={article.image}
                alt={article.title}
                storageKey={`blog-${article.id}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-brand-dark">
                {article.category}
              </div>
            </div>
            <h3 className="text-xl font-serif text-brand-text mb-2 line-clamp-2 group-hover:text-brand-green transition-colors">
              {article.title}
            </h3>
            <div className="flex items-center gap-4 text-xs text-stone-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {article.date}
              </span>
              <span>{article.readTime}</span>
            </div>
          </div>
        ))}
      </div>

      {selectedArticle && (
        <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
      )}
    </section>
  );
};

const ArticleModal = ({ article, onClose }: { article: Article; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto animate-in slide-in-from-bottom duration-300">
      <div className="relative h-[40vh] min-h-[300px]">
        <Image
          src={article.image}
          alt={article.title}
          storageKey={`blog-${article.id}-large`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-20"
        >
          <ChevronRight className="w-6 h-6 rotate-90" />
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <span className="inline-block px-3 py-1 bg-brand-green rounded-full text-[10px] font-bold uppercase mb-4">
            {article.category}
          </span>
          <h1 className="text-3xl font-serif mb-4 leading-tight">{article.title}</h1>
          <div className="flex items-center gap-4 text-sm opacity-80">
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" /> {article.author}
            </span>
            <span>•</span>
            <span>{article.date}</span>
            <span>•</span>
            <span>{article.readTime}</span>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-2xl mx-auto prose prose-stone prose-lg">
        <p className="lead text-xl text-stone-600 font-serif mb-8">
          Здесь будет краткое введение в статью, раскрывающее основную суть и привлекающее внимание
          читателя.
        </p>
        <p>
          Основной текст статьи... Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
          nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
        <h3>Почему это важно</h3>
        <p>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
          nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
          deserunt mollit anim id est laborum.
        </p>
        <div className="bg-brand-mint/30 p-6 rounded-2xl my-8 border border-brand-green/20">
          <h4 className="text-brand-green font-bold mb-2 uppercase text-xs tracking-wider">
            Совет эксперта
          </h4>
          <p className="text-stone-700 italic m-0">
            "Регулярность важнее интенсивности. Начните с 5 минут в день, и вы увидите результат."
          </p>
        </div>
        <p>
          Заключительная часть статьи с выводами и призывом к действию. Присоединяйтесь к нашим
          практикам в студии или онлайн.
        </p>
      </div>
    </div>
  );
};
