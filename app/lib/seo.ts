import { Metadata } from 'next';

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  noindex?: boolean;
  structuredData?: object;
}

// Generate comprehensive metadata for pages
export function generateMetadata({
  title,
  description,
  keywords = [],
  canonical,
  ogImage = '/logos/acme.svg',
  ogType = 'website',
  twitterCard = 'summary_large_image',
  noindex = false,
  structuredData,
}: SEOMetadata): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://sigmacode.ai';
  const fullTitle = title.includes('SIGMACODE') ? title : `${title} | SIGMACODE AI`;
  const url = canonical ? `${baseUrl}${canonical}` : baseUrl;

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    alternates: canonical ? { canonical: url } : undefined,
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: 'SIGMACODE AI',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: ogType,
    },
    twitter: {
      card: twitterCard,
      title: fullTitle,
      description,
      images: [ogImage],
      creator: '@sigmacode_ai',
      site: '@sigmacode_ai',
    },
    robots: {
      index: !noindex,
      follow: !noindex,
      googleBot: {
        index: !noindex,
        follow: !noindex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
      yahoo: process.env.YAHOO_VERIFICATION,
    },
    other: {
      'msapplication-TileColor': '#0066cc',
      'msapplication-config': '/browserconfig.xml',
      'theme-color': '#0066cc',
    },
    ...structuredData,
  };
}

// Common structured data generators
const structuredDataGenerators = {
  organization: () => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SIGMACODE AI',
    url: 'https://sigmacode.ai',
    logo: 'https://sigmacode.ai/logos/acme.svg',
    description: 'Security-First AI Platform for Enterprise',
    foundingDate: '2024',
    founders: [
      {
        '@type': 'Person',
        name: 'SIGMACODE Team',
      },
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'contact@sigmacode.ai',
    },
    sameAs: [
      'https://github.com/sigmacode-ai',
      'https://linkedin.com/company/sigmacode-ai',
      'https://twitter.com/sigmacode_ai',
    ],
  }),

  product: (product: {
    name: string;
    description: string;
    offers?: any[];
    aggregateRating?: any;
    review?: any[];
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: product.name,
    description: product.description,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    offers: product.offers,
    aggregateRating: product.aggregateRating,
    review: product.review,
    author: {
      '@type': 'Organization',
      name: 'SIGMACODE AI',
    },
    publisher: {
      '@type': 'Organization',
      name: 'SIGMACODE AI',
    },
  }),

  article: (article: {
    headline: string;
    description: string;
    author: string;
    datePublished: string;
    dateModified?: string;
    image?: string;
    mainEntityOfPage?: string;
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.headline,
    description: article.description,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'SIGMACODE AI',
      logo: {
        '@type': 'ImageObject',
        url: 'https://sigmacode.ai/logos/acme.svg',
      },
    },
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    image: article.image,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.mainEntityOfPage || 'https://sigmacode.ai',
    },
  }),

  faq: (faqs: { question: string; answer: string }[]) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }),

  event: (event: {
    name: string;
    description: string;
    startDate: string;
    endDate?: string;
    location?: any;
    image?: string;
    url?: string;
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
    eventStatus: 'https://schema.org/EventScheduled',
    location: event.location,
    image: event.image ? [{ '@type': 'ImageObject', url: event.image }] : undefined,
    url: event.url,
    organizer: {
      '@type': 'Organization',
      name: 'SIGMACODE AI',
    },
  }),
};

// Exportierte Hilfsfunktion für Komponenten, die einen JSON-String benötigen
// Deckt die von SchemaOrg.tsx erwarteten Typen ab
export function generateStructuredData(type: 'organization' | 'website' | 'software'): string {
  switch (type) {
    case 'organization': {
      const data = structuredDataGenerators.organization();
      return JSON.stringify(data);
    }
    case 'website': {
      const data = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'SIGMACODE AI',
        url: 'https://sigmacode.ai',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://sigmacode.ai/search?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      } as const;
      return JSON.stringify(data);
    }
    case 'software': {
      const data = structuredDataGenerators.product({
        name: 'SIGMACODE AI Platform',
        description: 'Security-First AI Platform for Enterprise with integrated AI Firewall.',
      });
      return JSON.stringify(data);
    }
    default: {
      // Fallback – sollte bei der aktuellen Typdefinition nicht auftreten
      return JSON.stringify({});
    }
  }
}

// SEO utilities
export const seoUtils = {
  // Generate breadcrumbs structured data
  generateBreadcrumbs: (breadcrumbs: { name: string; url: string }[]) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: breadcrumb.name,
      item: breadcrumb.url,
    })),
  }),

  // Generate sitemap entry
  generateSitemapEntry: (
    url: string,
    lastModified?: string,
    changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never',
    priority?: number,
  ) => ({
    url,
    lastModified: lastModified || new Date().toISOString(),
    changeFrequency: changeFrequency || 'monthly',
    priority: priority || 0.5,
  }),

  // Generate robots.txt content
  generateRobotsTxt: (allowedPaths: string[] = [], disallowedPaths: string[] = []) =>
    `
User-agent: *
${allowedPaths.length > 0 ? allowedPaths.map((path) => `Allow: ${path}`).join('\n') : ''}
${disallowedPaths.map((path) => `Disallow: ${path}`).join('\n')}

# Sitemaps
Sitemap: https://sigmacode.ai/sitemap.xml

# Crawl-delay
Crawl-delay: 1

# Host
Host: https://sigmacode.ai
`.trim(),

  // Generate sitemap XML
  generateSitemapXml: (
    urls: {
      url: string;
      lastModified?: string;
      changeFrequency?: string;
      priority?: number;
    }[],
  ) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (urlData) => `  <url>
    <loc>${urlData.url}</loc>
    ${urlData.lastModified ? `<lastmod>${urlData.lastModified}</lastmod>` : ''}
    ${urlData.changeFrequency ? `<changefreq>${urlData.changeFrequency}</changefreq>` : ''}
    ${urlData.priority ? `<priority>${urlData.priority}</priority>` : ''}
  </url>`,
  )
  .join('\n')}
</urlset>`,

  // Optimize meta description
  optimizeMetaDescription: (description: string, maxLength: number = 160) => {
    if (description.length <= maxLength) return description;

    const truncated = description.substring(0, maxLength - 3);
    const lastSpace = truncated.lastIndexOf(' ');

    return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
  },

  // Generate title with optimal length
  optimizeTitle: (title: string, maxLength: number = 60) => {
    if (title.length <= maxLength) return title;

    const truncated = title.substring(0, maxLength - 3);
    const lastSpace = truncated.lastIndexOf(' ');

    return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
  },
};
