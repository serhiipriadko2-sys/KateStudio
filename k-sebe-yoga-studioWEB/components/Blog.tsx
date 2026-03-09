import { Blog, BlogArticle, isSupabaseConfigured, supabase } from '@ksebe/shared';
import React, { useState, useEffect } from 'react';
import { useContentData } from '../hooks/useContentData';

const PREVIEW_COUNT = 3;

/**
 * BlogContainer for WEB
 * Fetches articles from Supabase and renders the shared Blog component.
 * Falls back to default content data when Supabase is not configured.
 * Supports inline "Все статьи" expansion.
 */
export const BlogContainer: React.FC = () => {
  const { articles: defaultArticles } = useContentData();
  const [articles, setArticles] = useState<BlogArticle[]>(defaultArticles);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const fetchArticles = async () => {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('published_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped = data.map(
          (item: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => ({
            id: item.id,
            category: item.category || 'Блог',
            title: item.title,
            excerpt: item.excerpt || '',
            image: item.image_url || '',
            date: item.published_at
              ? new Date(item.published_at).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'short',
                })
              : '',
            content: item.content || '',
          })
        );
        setArticles(mapped);
      }
    };

    fetchArticles();
  }, [defaultArticles]);

  const visibleArticles = showAll ? articles : articles.slice(0, PREVIEW_COUNT);
  const hasMore = articles.length > PREVIEW_COUNT;

  return (
    <Blog
      articles={visibleArticles}
      onShowAll={hasMore && !showAll ? () => setShowAll(true) : undefined}
    />
  );
};
