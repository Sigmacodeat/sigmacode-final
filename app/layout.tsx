import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { cookies } from 'next/headers';
import Header from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ScrollToTop } from '@/components/layout/ScrollToTop';
import { NextIntlClientProvider } from 'next-intl';
import { PWAInstallPrompt } from '@/components/pwa/PWAFeatures';
import { ToastProvider } from '@/components/ui/toast-context';
import { NotificationProvider } from '@/components/notifications/NotificationSystem';
import { AnalyticsConsent } from '@/components/consent/AnalyticsConsent';
import './globals.css';
import { Inter } from 'next/font/google';
import { SessionProviders } from '@/components/providers/SessionProviders';
import { DashboardHeaderGate } from '@/components/layout/DashboardHeaderGate';
import { ReactQueryProvider } from './providers/react-query';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://sigmacode-web.fly.dev';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'SIGMACODE Neural Firewall – Intelligent Defense. Autonomous Protection.',
    template: '%s · SIGMACODE Neural Firewall',
  },
  description:
    'Neurale, KI‑getriebene Firewall: Intelligent Defense. Autonomous Protection. SIGMAGUARD (powered by Superagent) als AI‑Firewall‑Layer und SIGMACODE API Gateway (powered by Kong). Sub‑100ms Latenz, Enterprise‑Security (SOC 2, GDPR, HIPAA).',
  keywords: [
    'Neural Firewall',
    'AI Security',
    'Enterprise AI Security',
    'Security-First AI',
    'SOC 2',
    'GDPR',
    'HIPAA',
    'API Security',
    'Sub-100ms Latency',
    'Enterprise Security',
    'AI Firewall',
    'AI Security',
    'SIGMACODE Neural Firewall',
    'SIGMAGUARD',
    'Superagent',
    'Kong API Gateway',
  ],
  authors: [{ name: 'SIGMACODE' }],
  creator: 'SIGMACODE',
  publisher: 'SIGMACODE',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: APP_URL,
    title: 'SIGMACODE Neural Firewall – Intelligent Defense. Autonomous Protection.',
    description:
      'Neurale, KI‑getriebene Firewall: Intelligent Defense. Autonomous Protection. SIGMAGUARD (powered by Superagent) als AI‑Firewall‑Layer und SIGMACODE API Gateway (powered by Kong). Sub‑100ms Latenz, Enterprise‑Security (SOC 2, GDPR, HIPAA).',
    siteName: 'SIGMACODE Neural Firewall',
    images: [
      {
        url: '/logo/sigmacode-ai-og.png',
        width: 1200,
        height: 630,
        alt: 'SIGMACODE Neural Firewall',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SIGMACODE Neural Firewall – Intelligent Defense. Autonomous Protection.',
    description:
      'Neurale, KI‑getriebene Firewall: Intelligent Defense. Autonomous Protection. SIGMAGUARD (powered by Superagent) als AI‑Firewall‑Layer und SIGMACODE API Gateway (powered by Kong). Sub‑100ms Latenz, Enterprise‑Security (SOC 2, GDPR, HIPAA).',
    images: ['/logo/sigmacode-ai-og.png'],
    creator: '@sigmacode_ai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export default async function RootLayout({ children }: { readonly children: React.ReactNode }) {
  // Ermittele Locale für html lang-Attribut aus NEXT_LOCALE Cookie (gesetzt durch next-intl)
  const cookieStore = cookies();
  const rawLocale = cookieStore.get('NEXT_LOCALE')?.value;
  const supported = ['de', 'en'] as const;
  const safeLocale = supported.includes((rawLocale as any) || '')
    ? (rawLocale as 'de' | 'en')
    : 'de';

  // Lade Übersetzungen basierend auf dem ermittelten Locale
  let messages: Record<string, unknown> = {};
  try {
    messages = (await import(`@/messages/${safeLocale}.json`)).default as Record<string, unknown>;
  } catch (err) {
    try {
      messages = (await import(`@/messages/de.json`)).default as Record<string, unknown>;
    } catch {
      messages = {};
    }
  }
  return (
    <html lang={safeLocale} dir="ltr" suppressHydrationWarning>
      <head>
        {process.env.NODE_ENV === 'production' && (
          <Script
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
            defer
            data-domain="sigmacode.ai"
          />
        )}
        <Script id="jsonld-website" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'SIGMACODE Neural Firewall',
            url: APP_URL,
            potentialAction: {
              '@type': 'SearchAction',
              target: `${APP_URL}/search?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          })}
        </Script>
        {/* JSON-LD: Product/SoftwareApplication */}
        <Script id="jsonld-product" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'SIGMACODE Neural Firewall',
            applicationCategory: 'SecurityApplication',
            operatingSystem: 'Web',
            url: new URL('/firewall', APP_URL).toString(),
            brand: {
              '@type': 'Brand',
              name: 'SIGMACODE',
              logo: new URL('/logos/neural-shield.svg', APP_URL).toString(),
            },
            offers: {
              '@type': 'Offer',
              url: new URL('/pricing', APP_URL).toString(),
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
            },
            description:
              'Neurale, KI-getriebene Firewall mit Shadow/Enforce Modes, x-request-id Korrelation, Audit-Logs und sub-100ms Performance. SIGMAGUARD (powered by Superagent) & SIGMACODE API Gateway (powered by Kong).',
          })}
        </Script>
      </head>
      <body
        className={`${fontSans.variable} font-sans min-h-screen antialiased`}
        style={{ backgroundColor: 'var(--bg)', color: 'var(--fg)' }}
      >
        <AnalyticsConsent />
        <PWAInstallPrompt />
        <NotificationProvider>
          <ToastProvider>
            <SessionProviders>
              <ReactQueryProvider>
                <NextIntlClientProvider locale={safeLocale} messages={messages}>
                  <div className="relative z-10">
                    <DashboardHeaderGate>
                      <Header />
                    </DashboardHeaderGate>
                    {children}
                    <Footer />
                    <ScrollToTop />
                  </div>
                </NextIntlClientProvider>
              </ReactQueryProvider>
            </SessionProviders>
          </ToastProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
