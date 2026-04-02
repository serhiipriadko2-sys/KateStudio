import { Blog, BlogArticle, isSupabaseConfigured, supabase } from '@ksebe/shared';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useContentData } from '../hooks/useContentData';

const PREVIEW_COUNT = 3;

interface BlogArticleRow {
  id: number | string;
  category?: string | null;
  title: string;
  excerpt?: string | null;
  image_url?: string | null;
  published_at?: string | null;
  content?: string | null;
}

export const BlogContainer: React.FC = () => {
  const { articles: defaultArticles } = useContentData();
  const [showAll, setShowAll] = useState(false);
  const { data: articles = defaultArticles } = useQuery<BlogArticle[]>({
    queryKey: ['public', 'articles', defaultArticles.map((article) => article.id)],
    queryFn: async () => {
      if (!isSupabaseConfigured || !supabase) {
        return defaultArticles;
      }

      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('published_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return defaultArticles;
      }

      return data.map((item: BlogArticleRow) => ({
        id: item.id,
        category: item.category || 'Р‘Р»РѕРі',
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
      }));
    },
    initialData: defaultArticles,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const visibleArticles = showAll ? articles : articles.slice(0, PREVIEW_COUNT);
  const hasMore = articles.length > PREVIEW_COUNT;

  return (
    <Blog
      articles={visibleArticles}
      onShowAll={hasMore && !showAll ? () => setShowAll(true) : undefined}
    />
  );
};
