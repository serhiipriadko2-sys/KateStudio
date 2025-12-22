import { useEffect, useState } from 'react';
import { ContentData } from '../data/content';
import { getContentData, subscribeContentUpdates } from '../services/contentStore';

export const useContentData = () => {
  const [content, setContent] = useState<ContentData>(() => getContentData());

  useEffect(() => {
    const update = () => setContent(getContentData());
    const unsubscribe = subscribeContentUpdates(update);
    return () => unsubscribe();
  }, []);

  return content;
};
