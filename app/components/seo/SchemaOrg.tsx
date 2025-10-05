// Schema.org Structured Data Component
// app/components/seo/SchemaOrg.tsx

'use client';

import { useEffect } from 'react';
import { generateStructuredData } from '@/lib/seo';

interface SchemaOrgProps {
  type: 'organization' | 'website' | 'software';
}

export function SchemaOrg({ type }: SchemaOrgProps) {
  useEffect(() => {
    // Add structured data to page
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = generateStructuredData(type);
    script.id = `schema-${type}`;

    // Remove existing script if present
    const existingScript = document.getElementById(`schema-${type}`);
    if (existingScript) {
      existingScript.remove();
    }

    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      const scriptToRemove = document.getElementById(`schema-${type}`);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [type]);

  return null; // This component doesn't render anything
}

// Multiple Schema.org types for complex pages
interface MultiSchemaProps {
  schemas: Array<'organization' | 'website' | 'software'>;
}

export function MultiSchemaOrg({ schemas }: MultiSchemaProps) {
  useEffect(() => {
    schemas.forEach((type) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = generateStructuredData(type);
      script.id = `schema-${type}`;

      // Remove existing script if present
      const existingScript = document.getElementById(`schema-${type}`);
      if (existingScript) {
        existingScript.remove();
      }

      document.head.appendChild(script);
    });

    // Cleanup on unmount
    return () => {
      schemas.forEach((type) => {
        const scriptToRemove = document.getElementById(`schema-${type}`);
        if (scriptToRemove) {
          scriptToRemove.remove();
        }
      });
    };
  }, [schemas]);

  return null;
}

// SEO Head component for pages
interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}

export function SEOHead({
  title,
  description,
  keywords,
  image = '/og-image.png',
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
}: SEOHeadProps) {
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = title;
    }

    // Update or add meta description
    const existingDescription = document.querySelector('meta[name="description"]');
    if (description) {
      if (existingDescription) {
        existingDescription.setAttribute('content', description);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = description;
        document.head.appendChild(meta);
      }
    }

    // Update keywords
    if (keywords) {
      const existingKeywords = document.querySelector('meta[name="keywords"]');
      if (existingKeywords) {
        existingKeywords.setAttribute('content', keywords.join(', '));
      } else {
        const meta = document.createElement('meta');
        meta.name = 'keywords';
        meta.content = keywords.join(', ');
        document.head.appendChild(meta);
      }
    }

    // Update Open Graph
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (title && ogTitle) {
      ogTitle.setAttribute('content', title);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (description && ogDescription) {
      ogDescription.setAttribute('content', description);
    }

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (image && ogImage) {
      ogImage.setAttribute('content', image);
    }

    const ogType = document.querySelector('meta[property="og:type"]');
    if (type && ogType) {
      ogType.setAttribute('content', type);
    }

    // Update Twitter Cards
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (title && twitterTitle) {
      twitterTitle.setAttribute('content', title);
    }

    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (description && twitterDescription) {
      twitterDescription.setAttribute('content', description);
    }

    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (image && twitterImage) {
      twitterImage.setAttribute('content', image);
    }

    // Add article-specific metadata
    if (type === 'article') {
      if (publishedTime) {
        const existingPublished = document.querySelector('meta[property="article:published_time"]');
        if (existingPublished) {
          existingPublished.setAttribute('content', publishedTime);
        } else {
          const meta = document.createElement('meta');
          meta.setAttribute('property', 'article:published_time');
          meta.setAttribute('content', publishedTime);
          document.head.appendChild(meta);
        }
      }

      if (modifiedTime) {
        const existingModified = document.querySelector('meta[property="article:modified_time"]');
        if (existingModified) {
          existingModified.setAttribute('content', modifiedTime);
        } else {
          const meta = document.createElement('meta');
          meta.setAttribute('property', 'article:modified_time');
          meta.setAttribute('content', modifiedTime);
          document.head.appendChild(meta);
        }
      }

      if (author) {
        const existingAuthor = document.querySelector('meta[property="article:author"]');
        if (existingAuthor) {
          existingAuthor.setAttribute('content', author);
        } else {
          const meta = document.createElement('meta');
          meta.setAttribute('property', 'article:author');
          meta.setAttribute('content', author);
          document.head.appendChild(meta);
        }
      }
    }
  }, [title, description, keywords, image, type, publishedTime, modifiedTime, author]);

  return null;
}
