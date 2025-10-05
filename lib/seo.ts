// SEO Optimization Library for SIGMACODE AI
// lib/seo.ts

import type { Metadata } from 'next';

// Schema.org structured data types
export interface Organization {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  logo: string;
  description: string;
  foundingDate: string;
  sameAs: string[];
  contactPoint: {
    '@type': string;
    contactType: string;
    email: string;
    telephone?: string;
    areaServed: string;
    availableLanguage: string;
  };
}

export interface WebSite {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  description: string;
  potentialAction: {
    '@type': string;
    target: string;
    'query-input': string;
  };
}

export interface SoftwareApplication {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
  operatingSystem: string;
  softwareVersion: string;
  author: {
    '@type': string;
    name: string;
    url: string;
  };
  offers: {
    '@type': string;
    price: string;
    priceCurrency: string;
  };
  aggregateRating: {
    '@type': string;
    ratingValue: string;
    ratingCount: string;
  };
}

// Generate Schema.org JSON-LD
export function generateOrganizationSchema(): Organization {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SIGMACODE AI GmbH',
    url: 'https://sigmacode.ai',
    logo: 'https://sigmacode.ai/logo.png',
    description:
      'Enterprise AI automation platform with advanced security features, SOC 2 Type II certified, serving Fortune 500 companies worldwide.',
    foundingDate: '2024',
    sameAs: [
      'https://twitter.com/sigmacode_ai',
      'https://linkedin.com/company/sigmacode-ai',
      'https://github.com/sigmacode-ai',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'contact@sigmacode.ai',
      areaServed: 'Worldwide',
      availableLanguage: 'English, German',
    },
  };
}

export function generateWebsiteSchema(): WebSite {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SIGMACODE AI - Enterprise AI Automation Platform',
    url: 'https://sigmacode.ai',
    description:
      'Transform your business with AI-powered automation. Save 40+ hours weekly, reduce costs by 60%, increase revenue by 35%. SOC 2 compliant.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://sigmacode.ai/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateSoftwareSchema(): SoftwareApplication {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SIGMACODE AI Platform',
    description:
      'Enterprise-grade AI automation platform with built-in security firewall, multi-agent orchestration, and compliance features.',
    url: 'https://sigmacode.ai',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web-based, Cloud',
    softwareVersion: '1.0.0',
    author: {
      '@type': 'Organization',
      name: 'SIGMACODE AI GmbH',
      url: 'https://sigmacode.ai',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5.0',
      ratingCount: '100',
    },
  };
}

// SEO utility functions
export function generateTitle(title: string): string {
  if (title.includes('SIGMACODE AI')) {
    return title;
  }
  return `${title} | SIGMACODE AI`;
}

export function generateDescription(description: string): string {
  const baseDescription =
    'Enterprise AI automation platform with advanced security features. SOC 2 Type II certified, HIPAA, GDPR compliant.';

  if (description.length < 50) {
    return `${description} | ${baseDescription}`;
  }

  return description;
}

export function generateKeywords(keywords: string[]): string[] {
  const baseKeywords = [
    'AI automation platform',
    'enterprise AI agents',
    'business process automation',
    'AI workflow automation',
    'artificial intelligence software',
    'enterprise AI solutions',
    'AI automation tools',
    'business process optimization',
    'multi-agent orchestration',
    'AI firewall protection',
    'real-time AI monitoring',
    'enterprise AI security',
    'AI for enterprises',
    'business automation software',
    'workflow automation platform',
    'AI productivity tools',
    'reduce operational costs',
    'increase business efficiency',
    'automate customer service',
    'AI data processing',
  ];

  return [...new Set([...keywords, ...baseKeywords])];
}

// SEO metadata for specific pages
export function getHomePageMetadata(): Metadata {
  return {
    title: generateTitle('Enterprise AI Automation Platform | Save 40+ Hours Weekly'),
    description: generateDescription(
      'Transform your business with AI-powered automation. Save 40+ hours weekly, reduce costs by 60%, increase revenue by 35%. SOC 2 compliant, enterprise-grade security.',
    ),
    keywords: generateKeywords([
      'AI automation',
      'enterprise AI',
      'business process automation',
      'AI agents',
      'workflow automation',
    ]),
    openGraph: {
      type: 'website',
      title: 'SIGMACODE AI - Enterprise AI Automation Platform',
      description:
        'Save 40+ hours weekly with AI-powered automation. Enterprise-grade security, SOC 2 compliant, 14-day free trial.',
      images: ['/og-image.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'SIGMACODE AI - Enterprise AI Automation Platform',
      description:
        'Save 40+ hours weekly with AI-powered automation. Enterprise-grade security, SOC 2 compliant.',
      images: ['/og-image.png'],
    },
  };
}

export function getUseCaseMetadata(useCase: string): Metadata {
  const useCaseTitles: Record<string, string> = {
    'healthcare-medical': 'Healthcare AI with HIPAA Firewall | SIGMACODE AI',
    'financial-trading': 'Financial Trading AI with MiFID II Compliance | SIGMACODE AI',
    'government-public': 'Government AI with GDPR Protection | SIGMACODE AI',
    'critical-infrastructure': 'Critical Infrastructure AI with Zero-Downtime | SIGMACODE AI',
    'pharmaceutical-rnd': 'Pharmaceutical R&D AI with FDA Compliance | SIGMACODE AI',
  };

  return {
    title: useCaseTitles[useCase] || generateTitle(`${useCase} | SIGMACODE AI`),
    description: generateDescription(
      `Industry-specific AI solution for ${useCase.replace('-', ' ')} with enterprise-grade security and compliance.`,
    ),
    keywords: generateKeywords([useCase, 'industry AI', 'enterprise solution', 'compliance']),
  };
}

export function getBlogMetadata(title: string, excerpt: string): Metadata {
  return {
    title: generateTitle(title),
    description: generateDescription(excerpt),
    keywords: generateKeywords(['AI', 'automation', 'enterprise', 'security', 'blog']),
    openGraph: {
      type: 'article',
      title,
      description: excerpt,
      images: ['/og-image.png'],
    },
  };
}

// SEO performance optimization
export function generateStructuredData(type: 'organization' | 'website' | 'software'): string {
  const schemas = {
    organization: generateOrganizationSchema(),
    website: generateWebsiteSchema(),
    software: generateSoftwareSchema(),
  };

  return JSON.stringify(schemas[type]);
}

// SEO analytics helpers
export function trackSEOEvent(event: string, data: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', event, data);
  }
}

// SEO URL optimization
export function generateSEOUrl(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// SEO content optimization
export function optimizeContentForSEO(content: string): string {
  // Add semantic HTML structure
  const optimized = content
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');

  return optimized;
}
