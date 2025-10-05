'use client';

import { useEffect } from 'react';

export function StructuredData() {
  useEffect(() => {
    // Remove any existing structured data
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach((script) => script.remove());

    const structuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        // Organization Schema
        {
          '@type': 'Organization',
          '@id': 'https://sigmacode.ai/#organization',
          name: 'SIGMACODE AI GmbH',
          url: 'https://sigmacode.ai',
          logo: {
            '@type': 'ImageObject',
            url: 'https://sigmacode.ai/logo.png',
            width: 512,
            height: 512,
          },
          description: 'Enterprise AI automation platform with advanced security features',
          foundingDate: '2024',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Sample Street 123',
            addressLocality: 'Berlin',
            postalCode: '10117',
            addressCountry: 'DE',
          },
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+49-30-12345678',
            contactType: 'customer service',
            email: 'hello@sigmacode.ai',
          },
          sameAs: [
            'https://twitter.com/sigmacode_ai',
            'https://linkedin.com/company/sigmacode-ai',
            'https://github.com/sigmacode-ai',
          ],
        },

        // SoftwareApplication Schema
        {
          '@type': 'SoftwareApplication',
          '@id': 'https://sigmacode.ai/#software',
          name: 'SIGMACODE AI Platform',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          offers: {
            '@type': 'Offer',
            price: '99',
            priceCurrency: 'USD',
            priceValidUntil: '2024-12-31',
            availability: 'https://schema.org/InStock',
          },
          description:
            'Enterprise-grade AI automation platform with multi-agent orchestration and advanced security features',
          featureList: [
            'Multi-Agent Orchestration',
            'AI Firewall Protection',
            'Real-time Monitoring',
            'Enterprise Security',
            'API Integration',
            'Analytics Dashboard',
          ],
          screenshot: 'https://sigmacode.ai/screenshot.png',
          softwareVersion: '1.0.0',
          fileSize: '0MB',
          downloadUrl: 'https://sigmacode.ai/get-started',
          provider: {
            '@id': 'https://sigmacode.ai/#organization',
          },
        },

        // WebSite Schema
        {
          '@type': 'WebSite',
          '@id': 'https://sigmacode.ai/#website',
          url: 'https://sigmacode.ai',
          name: 'SIGMACODE AI',
          description: 'Enterprise AI automation platform',
          publisher: {
            '@id': 'https://sigmacode.ai/#organization',
          },
          inLanguage: 'en-US',
        },

        // WebPage Schema
        {
          '@type': 'WebPage',
          '@id': 'https://sigmacode.ai/#webpage',
          url: 'https://sigmacode.ai',
          name: 'SIGMACODE AI - Enterprise AI Automation Platform',
          isPartOf: {
            '@id': 'https://sigmacode.ai/#website',
          },
          about: {
            '@id': 'https://sigmacode.ai/#organization',
          },
          description:
            'Transform your business with AI-powered automation. Save 40+ hours weekly, reduce costs by 60%, increase revenue by 35%.',
          breadcrumb: {
            '@id': 'https://sigmacode.ai/#breadcrumb',
          },
          inLanguage: 'en-US',
          potentialAction: [
            {
              '@type': 'ReadAction',
              target: ['https://sigmacode.ai'],
            },
          ],
        },

        // Breadcrumb Schema
        {
          '@type': 'BreadcrumbList',
          '@id': 'https://sigmacode.ai/#breadcrumb',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: 'https://sigmacode.ai',
            },
          ],
        },

        // Product Schema
        {
          '@type': 'Product',
          '@id': 'https://sigmacode.ai/#product',
          name: 'SIGMACODE AI Platform',
          description: 'Enterprise AI automation platform with multi-agent orchestration',
          brand: {
            '@id': 'https://sigmacode.ai/#organization',
          },
          category: 'Business Software',
          offers: {
            '@type': 'Offer',
            price: '99',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            priceValidUntil: '2024-12-31',
            hasMerchantReturnPolicy: {
              '@type': 'MerchantReturnPolicy',
              applicableCountry: 'DE',
              returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
              merchantReturnDays: 30,
              returnMethod: 'https://schema.org/ReturnByMail',
              returnFees: 'https://schema.org/FreeReturn',
            },
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.9',
            reviewCount: '1000',
            bestRating: '5',
            worstRating: '1',
          },
          review: [
            {
              '@type': 'Review',
              author: {
                '@type': 'Person',
                name: 'Sarah Chen',
              },
              reviewRating: {
                '@type': 'Rating',
                ratingValue: '5',
                bestRating: '5',
              },
              reviewBody: 'SIGMACODE AI transformed our workflow. We reduced manual tasks by 70%.',
            },
          ],
        },

        // Service Schema
        {
          '@type': 'Service',
          '@id': 'https://sigmacode.ai/#service',
          name: 'AI Automation Services',
          description: 'Comprehensive AI automation solutions for enterprises',
          provider: {
            '@id': 'https://sigmacode.ai/#organization',
          },
          serviceType: 'Software as a Service',
          areaServed: 'Worldwide',
          availableChannel: {
            '@type': 'ServiceChannel',
            availableLanguage: 'en',
            serviceUrl: 'https://sigmacode.ai',
          },
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'AI Automation Plans',
            itemListElement: [
              {
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'Service',
                  name: 'Starter Plan',
                  description: 'Perfect for small teams getting started with AI',
                },
              },
            ],
          },
        },
      ],
    };

    // Add structured data to page
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach((s) => s.remove());
    };
  }, []);

  return null;
}
