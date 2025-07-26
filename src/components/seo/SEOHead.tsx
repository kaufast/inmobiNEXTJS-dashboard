import React from 'react';
import { Helmet } from 'react-helmet';
import { useLanguage } from '@/hooks/use-language';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  structuredData?: object;
  noIndex?: boolean;
  locale?: string;
  alternateLocales?: Array<{ locale: string; url: string }>;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  canonical,
  image = '/images/family-home.webp',
  type = 'website',
  structuredData,
  noIndex = false,
  locale,
  alternateLocales = [],
}) => {
  const { currentLanguage: currentLocale } = useLanguage();
  const pageLocale = locale || currentLocale;
  
  // Default values
  const defaultTitle = 'Buy & Rent Properties | Inmobi Barcelona & Mexico';
  const defaultDescription = 'Discover top properties for sale & rent. AI-adapted search. Fast listings updates. Trusted by expats.';
  const siteUrl = 'https://inmobi.mobi';
  
  const fullTitle = title ? `${title} | Inmobi` : defaultTitle;
  const fullDescription = description || defaultDescription;
  const fullCanonical = canonical ? `${siteUrl}${canonical}` : `${siteUrl}/`;
  const fullImage = image.startsWith('http') ? image : `${siteUrl}${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullCanonical} />
      
      {/* Language and Locale */}
      <html lang={pageLocale} />
      <meta property="og:locale" content={pageLocale.replace('-', '_')} />
      
      {/* Alternate Language Links */}
      {alternateLocales.map(({ locale: altLocale, url }) => (
        <link
          key={altLocale}
          rel="alternate"
          hrefLang={altLocale}
          href={`${siteUrl}${url}`}
        />
      ))}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:site_name" content="Inmobi" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />
      
      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};