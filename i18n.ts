import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  // Unterstützte Locales
  const supported = ['de', 'en'] as const;
  // Eingehenden Wert robust normalisieren (kann undefined sein)
  const incoming = typeof locale === 'string' ? locale : 'de';
  const isSupported = (supported as readonly string[]).includes(incoming);
  const safeLocale: string = isSupported ? incoming : 'de';

  // Messages laden mit robuster Fallback-Logik, um 500er zu vermeiden
  let messages: Record<string, unknown> = {};
  try {
    messages = (await import(`./messages/${safeLocale}.json`)).default;
  } catch (err) {
    // Fallback auf Default-Locale, falls die gewünschte Locale fehlt/fehlschlägt
    try {
      messages = (await import(`./messages/de.json`)).default;
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          `[i18n] Konnte Messages für locale "${safeLocale}" nicht laden. Fallback auf "de".`,
          err,
        );
      }
    } catch (fallbackErr) {
      // Letzte Reserve: leere Messages, damit keine 500-Fehler entstehen
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          '[i18n] Fallback auf leere Messages, da auch Default-Locale nicht geladen werden konnte.',
          fallbackErr,
        );
      }
      messages = {};
    }
  }

  return {
    locale: safeLocale,
    messages,
  };
});
