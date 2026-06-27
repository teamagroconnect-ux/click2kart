import React from 'react'
import { Helmet } from 'react-helmet-async'

export function SEO({
  title,
  description,
  image,
  url,
  type = 'website',
  keywords,
}) {
  const defaultTitle = 'Click2Kart - India\'s Premier B2B Electronics Wholesale Marketplace'
  const defaultDescription = 'Buy electronics wholesale across India with GST billing, secure payments, logistics support and trusted B2B suppliers on Click2Kart.'
  const defaultImage = 'https://click2kart.net/logo.png'
  const defaultUrl = 'https://click2kart.net'

  const pageTitle = title ? `${title} | Click2Kart` : defaultTitle
  const pageDescription = description || defaultDescription
  const pageImage = image || defaultImage
  const pageUrl = url ? `https://click2kart.net${url}` : defaultUrl

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Open Graph */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:type" content={type} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />

      {/* Canonical URL */}
      <link rel="canonical" href={pageUrl} />
    </Helmet>
  )
}

export function injectJsonLd(json) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(json);
  document.head.appendChild(script);
  return () => {
    try { document.head.removeChild(script) } catch {}
  };
}
