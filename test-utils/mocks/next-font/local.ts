// Minimal Mock for next/font/local to be used in Jest tests
/* eslint-disable @typescript-eslint/no-unused-vars */

export type LocalFontOptions = {
  src: string | { path: string; weight?: string; style?: string }[];
  variable?: string;
  display?: string;
  preload?: boolean;
  adjustFontFallback?: boolean;
  fallback?: string[];
};

function localFont(options: LocalFontOptions) {
  const nameFromSrc =
    typeof options.src === 'string'
      ? options.src.split('/').pop()?.split('.')[0] || 'local-font'
      : 'local-font';

  const classBase = (options.variable?.replace(/^-+/, '') || nameFromSrc || 'local-font')
    .replace(/\s+/g, '-')
    .toLowerCase();

  return {
    className: `${classBase}-mock`,
    variable: `--font-${classBase}`,
    style: { fontFamily: classBase },
  } as const;
}

export default localFont;
