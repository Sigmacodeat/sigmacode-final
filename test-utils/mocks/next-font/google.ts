// Minimal Mock for next/font/google to be used in Jest tests
// Exports font loader functions like Inter, Roboto, etc., returning simple objects

/* eslint-disable @typescript-eslint/no-unused-vars */

export type GoogleFontOptions = {
  subsets?: string[];
  weight?: string | string[];
  style?: string | string[];
  variable?: string;
  display?: string;
  preload?: boolean;
  adjustFontFallback?: boolean;
  fallback?: string[];
};

function createFontMock(fontFamily: string) {
  return function (_options: GoogleFontOptions = {}) {
    return {
      className: `${fontFamily.replace(/\s+/g, '-')}-mock`,
      variable: `--font-${fontFamily.replace(/\s+/g, '-').toLowerCase()}`,
      style: { fontFamily },
    } as const;
  };
}

// Commonly used Google fonts
export const Inter = createFontMock('Inter');
export const Roboto = createFontMock('Roboto');
export const Roboto_Mono = createFontMock('Roboto Mono');
export const Source_Sans_3 = createFontMock('Source Sans 3');
export const Lato = createFontMock('Lato');
export const Poppins = createFontMock('Poppins');
export const Open_Sans = createFontMock('Open Sans');

// Fallback default export (rarely used)
const GoogleFont = createFontMock('GoogleFont');
export default GoogleFont;
