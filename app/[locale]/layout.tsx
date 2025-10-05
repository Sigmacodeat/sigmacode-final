import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  params: { locale: string };
};

// Locale-spezifisches Layout übergibt nur die Children.
// Die Locale-Ermittlung & Messages kommen aus dem RootLayout (NextIntlClientProvider)
export default async function LocaleLayout({ children, params: { locale } }: Props) {
  const supported = ['de', 'en'] as const;
  const incoming = typeof locale === 'string' ? locale : 'de';
  const safeLocale: string = (supported as readonly string[]).includes(incoming) ? incoming : 'de';

  // Provider ist im RootLayout gesetzt – hier nur Children rendern
  return children;
}
