export const useTranslations = () => (key: string, values?: Record<string, any>) => {
  if (!values) return key;
  // Primitive Placeholder-Interpolation
  return Object.keys(values).reduce(
    (acc, k) => acc.replace(new RegExp(`{${k}}`, 'g'), String(values[k])),
    key,
  );
};

export const useFormatter = () => ({
  number: (n: number) => String(n),
});

export const NextIntlClientProvider = ({ children }: any) => children;

export const useLocale = () => 'de';
