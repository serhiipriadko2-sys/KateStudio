import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
  url?: string;
}

const DEFAULT_TITLE = 'К себе — студия йоги в Дубне';
const DEFAULT_DESCRIPTION =
  'Студия йоги в Дубне: Inside Flow, хатха-йога, саундхилинг и мягкие практики для тела и внимания.';
const DEFAULT_IMAGE = '/og-image.jpg';
const SITE_URL = 'https://ksebe-studio.ru';
const SITE_NAME = 'К себе';

export const SEO: React.FC<SEOProps> = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  type = 'website',
  url = SITE_URL,
}) => {
  const fullTitle = title === DEFAULT_TITLE ? title : `${title} | К себе`;
  const fullUrl = url.startsWith('http') ? url : `${SITE_URL}${url}`;
  const fullImage = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  return (
    <Helmet>
      {/* Standard */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
    </Helmet>
  );
};
