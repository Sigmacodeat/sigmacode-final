// SIGMACODE AI - Production Deployment Configuration
// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  productionBrowserSourceMaps: false, // Disable source maps in production
  optimizeFonts: true, // Optimize font loading

  // Performance optimizations
  swcMinify: true, // Use SWC for faster minification
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,

  // Image optimization
  images: {
    domains: ['sigmacode.ai', 'cdn.sigmacode.ai', 'localhost'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Security headers werden in middleware.ts gesetzt

  // Redirects
  async redirects() {
    return [
      {
        source: '/old-path',
        destination: '/new-path',
        permanent: true,
      },
    ];
  },

  // Rewrites for API routes
  async rewrites() {
    return [
      {
        source: '/api/health-check',
        destination: '/api/health',
      },
    ];
  },

  // Static asset caching headers
  async headers() {
    return [
      // Next.js internals
      {
        source: '/_next/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/_next/image/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      // Public assets (root files)
      {
        source: '/favicon.ico',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/robots.txt',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }],
      },
      {
        source: '/sitemap.xml',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }],
      },
      {
        source: '/manifest.webmanifest',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/site.webmanifest',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      // Static folders from public/
      {
        source: '/logo/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/logos/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },

  // Environment variables
  env: {
    // Canonical public app URL
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      'http://localhost:3000',
    // Backward compatibility: expose old key if some code still reads it
    NEXT_PUBLIC_BASE_URL:
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'http://localhost:3000',
    NEXT_PUBLIC_ANALYTICS_ID: process.env.NEXT_PUBLIC_ANALYTICS_ID,
    NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
  },

  // Build configuration
  generateBuildId: async () => {
    // Use a timestamp-based build ID for cache busting
    return `build-${Date.now()}`;
  },

  // Webpack configuration (single consolidated function)
  webpack: (config, { dev, isServer, webpack }) => {
    // Add SVGR for importing SVGs as React components
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: { and: [/[jt]sx?$/] },
      use: [{ loader: require.resolve('@svgr/webpack'), options: { svgo: true } }],
    });

    // Manuelle splitChunks-Optimierung entfernt; Next.js Default nutzen

    // Stelle sicher, dass das Bundle im Server-Kontext 'globalThis' als Global-Objekt verwendet
    config.output = {
      ...config.output,
      globalObject: 'globalThis',
    };

    // Serverseitige Aliases für Browser-only Pakete setzen
    if (isServer) {
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        'monaco-editor': false,
        mermaid: false,
        dompurify: false,
        jsdom: false,
      };
    }

    // Bundle analyzer toggle via env
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(new BundleAnalyzerPlugin({ analyzerMode: 'server', openAnalyzer: true }));
    }

    return config;
  },

  // TypeScript configuration (Build bei Fehlern brechen)
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint configuration: In CI strikt, lokal toleranter
  eslint: {
    ignoreDuringBuilds: process.env.CI !== 'true',
  },

  // Output configuration
  output: 'standalone',

  // Experimental features for production
  ...(process.env.NODE_ENV === 'production' && {
    compiler: {
      removeConsole: {
        exclude: ['error', 'warn'], // Keep error and warn logs
      },
    },
  }),

  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

// Integrate next-intl plugin for App Router internationalization
const withNextIntl = require('next-intl/plugin')('./i18n.ts');
// Integrate Sentry for error monitoring
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(
  withNextIntl(nextConfig),
  {
    // Sentry options (server & client SDK)
    silent: true,
  },
  {
    // Webpack plugin options
    hideSourcemaps: true,
  },
);
