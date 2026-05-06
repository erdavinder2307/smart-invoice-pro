import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SITE_CONFIG, toAbsoluteUrl } from './siteConfig';

const SeoHead = ({
  title,
  description,
  canonicalPath,
  robots = 'index,follow',
  ogType = 'website',
  image,
  keywords,
  jsonLd = []
}) => {
  const effectiveTitle = title ? `${title} | ${SITE_CONFIG.siteName}` : `${SITE_CONFIG.siteName} | ${SITE_CONFIG.brandTitle}`;
  const canonicalUrl = toAbsoluteUrl(canonicalPath || '/');
  const ogImageUrl = toAbsoluteUrl(image || SITE_CONFIG.defaultOgImage);

  return (
    <Helmet>
      <title>{effectiveTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:site_name" content={SITE_CONFIG.siteName} />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={effectiveTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:locale" content={SITE_CONFIG.defaultLocale} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={effectiveTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={ogImageUrl} />
      <meta name="twitter:site" content={SITE_CONFIG.twitterHandle} />

      {jsonLd.filter(Boolean).map((schema, idx) => (
        <script key={`jsonld-${idx}`} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SeoHead;
