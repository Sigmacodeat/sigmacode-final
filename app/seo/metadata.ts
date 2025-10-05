import type { Metadata, Viewport } from 'next';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://sigmacode.ai';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'SIGMACODE AI - Enterprise AI Automation Platform | Save 40+ Hours Weekly',
    template: '%s | SIGMACODE AI',
  },
  description:
    'Transform your business with AI-powered automation. Save 40+ hours weekly, reduce costs by 60%, increase revenue by 35%. SOC 2 compliant, enterprise-grade security.',
  keywords: [
    // Primary keywords
    'AI automation platform',
    'enterprise AI agents',
    'business process automation',
    'AI workflow automation',
    'artificial intelligence software',

    // Long-tail keywords
    'automate repetitive tasks with AI',
    'AI agents for business',
    'enterprise AI solutions',
    'AI automation tools',
    'business process optimization',

    // Feature keywords
    'multi-agent orchestration',
    'AI firewall protection',
    'real-time AI monitoring',
    'enterprise AI security',

    // Industry keywords
    'AI for enterprises',
    'business automation software',
    'workflow automation platform',
    'AI productivity tools',

    // Benefit keywords
    'reduce operational costs',
    'increase business efficiency',
    'automate customer service',
    'AI data processing',
  ],
  authors: [{ name: 'SIGMACODE AI Team', url: 'https://sigmacode.ai' }],
  creator: 'SIGMACODE AI GmbH',
  publisher: 'SIGMACODE AI GmbH',
  applicationName: 'SIGMACODE AI Platform',
  category: 'business software',
  classification: 'Enterprise Software',
  generator: 'Next.js 14',

  // Enhanced OpenGraph
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'SIGMACODE AI',
    title: 'SIGMACODE AI - Enterprise AI Automation Platform',
    description:
      'Save 40+ hours weekly with AI-powered automation. Enterprise-grade security, SOC 2 compliant, 14-day free trial.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SIGMACODE AI - Enterprise AI Automation Platform',
        type: 'image/png',
      },
    ],
    locale: 'en_US',
    alternateLocale: ['de_DE'],
  },

  // Enhanced Twitter
  twitter: {
    card: 'summary_large_image',
    creator: '@sigmacode_ai',
    site: '@sigmacode_ai',
    title: 'SIGMACODE AI - Enterprise AI Automation Platform',
    description:
      'Save 40+ hours weekly with AI-powered automation. Enterprise-grade security, SOC 2 compliant.',
    images: ['/og-image.png'],
  },

  // Enhanced Icons
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: ['/favicon.ico'],
    other: [{ rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#8b5cf6' }],
  },

  manifest: '/site.webmanifest',

  // Enhanced Robots
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Verification
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
    yahoo: 'yahoo-site-verification-code',
    other: {
      'facebook-domain-verification': 'facebook-domain-verification-code',
    },
  },

  // Additional metadata
  referrer: 'strict-origin-when-cross-origin',
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  // Content metadata
  abstract: 'Enterprise AI automation platform with advanced security features',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  colorScheme: 'light dark',
};
