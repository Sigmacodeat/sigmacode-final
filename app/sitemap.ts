import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://sigmacode-web.fly.dev';
  const locales = ['de', 'en'];
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Generate entries for each locale
  locales.forEach((locale) => {
    const localePrefix = locale === 'de' ? '' : `/${locale}`;
    const fullBase = locale === 'de' ? base : `${base}${localePrefix}`;

    sitemapEntries.push(
      {
        url: `${fullBase}/`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${fullBase}/security`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.5,
      },
      {
        url: `${fullBase}/contact`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.5,
      },
      // Core app routes
      {
        url: `${fullBase}/agents`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      },
      {
        url: `${fullBase}/firewall`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      },
      {
        url: `${fullBase}/workflows`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      },
      {
        url: `${fullBase}/mas`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      },
      {
        url: `${fullBase}/use-cases`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      },
      // Resources
      {
        url: `${fullBase}/docs`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.4,
      },
      {
        url: `${fullBase}/changelog`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.4,
      },
      // Auth + product pages
      {
        url: `${fullBase}/login`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.3,
      },
      {
        url: `${fullBase}/register`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.3,
      },
      {
        url: `${fullBase}/chat`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.5,
      },
      {
        url: `${fullBase}/analytics`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.5,
      },
      {
        url: `${fullBase}/dashboard`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.5,
      },
      {
        url: `${fullBase}/blog`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.5,
      },
    );
  });

  return sitemapEntries;
}
