import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
  title = 'Purcmium - Nepal\'s #1 Affiliate Product Buying Platform',
  description = 'Buy products from top brands like Sony, Samsung, Apple, Nike, Adidas, Dell, HP, and more. Nepal\'s most trusted online shopping platform with verified links to Amazon, ShareASale, and premium retailers.',
  keywords = 'buy products Nepal, online shopping Nepal, Sony Nepal, Samsung Nepal, Apple Nepal, Nike Nepal, Dell Nepal, HP Nepal, Amazon Nepal, ShareASale Nepal, best deals Nepal',
  image = 'https://purcmium.com/perciumt.png',
  url = 'https://purcmium.com',
  type = 'website',
  structuredData = null,
  canonical = null,
  robots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
}) => {
  const siteTitle = title.includes('Purcmium') ? title : `${title} | Purcmium`;
  const canonicalUrl = canonical || url;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="title" content={siteTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Purcmium" />
      <meta property="og:locale" content="en_NP" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={siteTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Additional Meta Tags */}
      <meta name="robots" content={robots} />
      <meta name="googlebot" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="geo.region" content="NP" />
      <meta name="geo.placename" content="Nepal" />
      <meta httpEquiv="content-language" content="en-NP" />

      {/* Structured Data (JSON-LD) */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
