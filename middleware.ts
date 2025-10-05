import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const locales = ['de', 'en'] as const;
type Locale = (typeof locales)[number];
const defaultLocale: Locale = 'de';

const PROTECTED_PREFIXES = ['/dify', '/console'];
// Detect static assets by common prefixes OR by having a file extension at the end (e.g., /grid.svg)
const isAssetPath = (pathname: string) => {
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/public') ||
    pathname.startsWith('/logo') ||
    pathname.startsWith('/logos') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/api/health')
  ) {
    return true;
  }
  // Any path that ends with a dot-extension should be treated as a static asset
  // Example: /grid.svg, /site.webmanifest, /robots.txt
  const hasExtension = /\.[a-zA-Z0-9]+$/.test(pathname);
  return hasExtension;
};

export async function middleware(req: NextRequest) {
  // Ensure request correlation id
  const requestId =
    req.headers.get('x-request-id') ||
    (globalThis.crypto && 'randomUUID' in globalThis.crypto
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
  // Redirect www → apex in Produktion
  const host = req.headers.get('host') || '';
  if (host.toLowerCase().startsWith('www.sigmacode.ai')) {
    const url = new URL(req.url);
    url.host = 'sigmacode.ai';
    const res = NextResponse.redirect(url, 308);
    res.headers.set('x-request-id', requestId);
    return res;
  }

  const { pathname, search } = new URL(req.url);
  const segments = pathname.split('/').filter(Boolean);
  const pathLocale = ((): Locale | null => {
    const seg = segments[0];
    return locales.includes(seg as Locale) ? (seg as Locale) : null;
  })();

  const isProtectedPath = (() => {
    // Direct protected prefixes (e.g. /dify, /app, /console)
    if (PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) return true;
    // Localized form: /{locale}/{protected}
    if (segments.length >= 2 && locales.includes(segments[0] as Locale)) {
      const second = `/${segments[1]}`;
      if (PROTECTED_PREFIXES.includes(second)) return true;
    }
    return false;
  })();

  if (isAssetPath(pathname)) {
    // Für Assets keine i18n- oder Auth-Verarbeitung
    return NextResponse.next();
  }

  // Root '/': Redirect auf Default-Locale
  if (pathname === '/') {
    const url = new URL(req.url);
    url.pathname = `/${defaultLocale}`;
    const res = NextResponse.redirect(url, 307);
    res.headers.set('x-request-id', requestId);
    return res;
  }

  // Auth-Gate für geschützte Bereiche (nach Asset-Check, vor i18n)
  if (isProtectedPath) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const loginLocale = pathLocale ?? defaultLocale;
      const loginUrl = new URL(`/${loginLocale}/login`, req.url);
      loginUrl.searchParams.set('callbackUrl', pathname + search);
      const res = NextResponse.redirect(loginUrl);
      res.headers.set('x-request-id', requestId);
      return res;
    }
  }

  // Bridge: Localized Dify path -> set i18nextLng cookie and rewrite to /dify
  // Example: /de/dify/...  => Cookie i18nextLng=de-DE, rewrite to /dify/...
  if (segments.length >= 2 && locales.includes(segments[0] as Locale) && segments[1] === 'dify') {
    const url = new URL(req.url);
    // strip locale prefix
    const rewrittenPath = '/' + segments.slice(1).join('/');
    url.pathname = rewrittenPath;
    const res = NextResponse.rewrite(url);
    const mapLocaleToDify = (l: Locale): string => (l === 'de' ? 'de-DE' : 'en-US');
    const lng = mapLocaleToDify(segments[0] as Locale);
    res.cookies.set('i18nextLng', lng, { path: '/dify', maxAge: 60 * 60 * 24 * 365 });
    res.headers.set('x-request-id', requestId);
    return addSecurityHeaders(res);
  }

  // Exclude /dify from next-intl entirely (Dify handles its own i18n)
  if (pathname === '/dify' || pathname.startsWith('/dify/')) {
    const res = NextResponse.next();
    res.headers.set('x-request-id', requestId);
    return addSecurityHeaders(res);
  }

  // Für alle anderen Pfade: normal weiterleiten, Security-Header setzen
  const res = NextResponse.next();
  res.headers.set('x-request-id', requestId);
  return addSecurityHeaders(res);
}

// Kapselt i18n und Security-Header-Anreicherung
function addSecurityHeaders(response: NextResponse) {
  const isProd = process.env.NODE_ENV === 'production';

  // In Entwicklung: keine strengen Security-Header setzen, um HMR/Webpack nicht zu stören
  if (!isProd) {
    response.headers.set('X-Powered-By', 'SIGMACODE AI');
    return response;
  }

  // Produktion: harte Security-Header setzen
  // Note: Next.js requires 'unsafe-inline' and 'unsafe-eval' for hydration and HMR
  const scriptSrc = ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https:'];
  const connectSrc = ["'self'", 'https:', 'wss:'];
  const cspDirectives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'base-uri': ["'self'"],
    'frame-ancestors': ["'none'"],
    'script-src': scriptSrc,
    'style-src': ["'self'", "'unsafe-inline'", 'https:'],
    'img-src': ["'self'", 'data:', 'blob:', 'https:'],
    'font-src': ["'self'", 'data:', 'https:'],
    'connect-src': connectSrc,
    'object-src': ["'none'"],
    'media-src': ["'self'", 'blob:', 'https:'],
    'frame-src': ["'self'"],
    'worker-src': ["'self'", 'blob:'],
    'manifest-src': ["'self'"],
    'form-action': ["'self'"],
    'upgrade-insecure-requests': [],
    'report-to': ['csp-endpoint'],
  };

  const csp = Object.entries(cspDirectives)
    .map(([k, v]) => `${k} ${v.join(' ')}`)
    .join('; ');

  const prodHeaders: Record<string, string> = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '0',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': [
      'accelerometer=()',
      'autoplay=()',
      'camera=(self)',
      'clipboard-read=()',
      'clipboard-write=(self)',
      'display-capture=()',
      'encrypted-media=()',
      'fullscreen=(self)',
      'geolocation=()',
      'gyroscope=()',
      'magnetometer=()',
      'microphone=(self)',
      'midi=()',
      'payment=(self)',
      'picture-in-picture=()',
      'publickey-credentials-get=()',
      'screen-wake-lock=()',
      'usb=()',
      'web-share=()',
      'xr-spatial-tracking=()',
    ].join(', '),
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Origin-Agent-Cluster': '?1',
    'Content-Security-Policy': csp,
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  };

  // Reporting-API endpoints
  prodHeaders['Reporting-Endpoints'] = 'csp-endpoint="/api/security/csp-report"';
  prodHeaders['Report-To'] = JSON.stringify({
    group: 'csp-endpoint',
    max_age: 10886400,
    endpoints: [{ url: '/api/security/csp-report' }],
  });

  Object.entries(prodHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  response.headers.set('X-RateLimit-Limit', '100');
  response.headers.set('X-RateLimit-Remaining', '99');
  response.headers.set('X-RateLimit-Reset', new Date(Date.now() + 60000).toISOString());
  response.headers.set('X-Response-Time', Date.now().toString());
  response.headers.set('X-Powered-By', 'SIGMACODE AI');
  response.headers.set('Server', 'SIGMACODE-Server/1.0');

  return response;
}

export const config = {
  matcher: ['/((?!api/|_next/|favicon|assets|public|logo|logos|images|api/health).*)'],
};
