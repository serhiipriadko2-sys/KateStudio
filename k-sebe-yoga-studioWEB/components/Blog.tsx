import {
  ArrowRight,
  BookOpen,
  X,
  Clock,
  Calendar as CalendarIcon,
  User,
  Share2,
  Check,
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useContentData } from '../hooks/useContentData';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useScrollLock } from '../hooks/useScrollLock';
import { FadeIn } from './FadeIn';
import { Image } from './Image';

export const Blog: React.FC = () => {
  const { articles } = useContentData();
  const [selectedArticle, setSelectedArticle] = useState<(typeof articles)[0] | null>(null);
  const [copied, setCopied] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useScrollLock(!!selectedArticle);
  useFocusTrap(dialogRef, !!selectedArticle, closeButtonRef);

  const handleShare = () => {
    // In a real app with routing, this would copy the specific URL like /blog/1
    const url = window.location.href.split('#')[0] + '#blog';
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <section id="blog" className="py-24 px-6 md:px-12 max-w-7xl mx-auto scroll-mt-20">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
        <FadeIn>
          <h4 className="text-brand-green tracking-[0.2em] text-xs font-bold uppercase mb-4">
            Блог
          </h4>
          <h2 className="text-4xl md:text-6xl font-serif text-brand-text/90">Полезное</h2>
        </FadeIn>

        <FadeIn delay={200} direction="left">
          <button className="flex items-center gap-2 text-brand-text hover:text-brand-green transition-colors group">
            <span className="text-sm font-medium uppercase tracking-wider">Все статьи</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </FadeIn>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {articles.map((article, idx) => (
          <FadeIn key={article.id} delay={idx * 150} direction="up" className="h-full">
            <article
              className="group h-full flex flex-col cursor-pointer"
              onClick={() => setSelectedArticle(article)}
            >
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
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3" /> {article.date}
                  </span>
                  <span className="w-1 h-1 bg-stone-300 rounded-full"></span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 3 мин
                  </span>
                </div>
                <h3 className="text-xl font-serif text-brand-text mb-3 leading-snug group-hover:text-brand-green transition-colors">
                  {article.title}
                </h3>
                <p className="text-stone-500 text-sm leading-relaxed mb-6 line-clamp-3">
                  {article.excerpt}
                </p>
                <div className="mt-auto">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-green border-b border-brand-green/20 pb-0.5 group-hover:border-brand-green transition-colors">
                    Читать
                  </span>
                </div>
              </div>
            </article>
          </FadeIn>
        ))}
      </div>

      {/* Article Reader Modal */}
      {selectedArticle && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="blog-modal-title"
            tabIndex={-1}
            className="bg-white w-full max-w-2xl h-[85vh] rounded-[2rem] shadow-2xl overflow-hidden relative flex flex-col animate-in slide-in-from-bottom-10 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Image */}
            <div className="h-64 relative shrink-0">
              <Image
                src={selectedArticle.image}
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={handleShare}
                  aria-label="Скопировать ссылку на статью"
                  className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors"
                  title="Скопировать ссылку"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => setSelectedArticle(null)}
                  ref={closeButtonRef}
                  aria-label="Закрыть статью"
                  className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="absolute bottom-6 left-6 md:left-8 right-6">
                <span className="bg-brand-green text-white px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold mb-3 inline-block">
                  {selectedArticle.category}
                </span>
                <h2
                  id="blog-modal-title"
                  className="text-2xl md:text-3xl font-serif text-white leading-tight"
                >
                  {selectedArticle.title}
                </h2>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
              <div className="flex items-center gap-6 text-sm text-stone-400 mb-8 border-b border-stone-100 pb-6">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Катя Габран</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>3 мин чтения</span>
                </div>
              </div>

              <div
                className="prose prose-stone prose-headings:font-serif prose-headings:text-brand-text prose-p:text-stone-600 prose-a:text-brand-green max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
              />

              <div className="mt-12 pt-8 border-t border-stone-100">
                <p className="text-center text-stone-400 italic font-serif text-lg">
                  "Практикуй, и все придет"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
