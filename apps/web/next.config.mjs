import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@nesso/design-system', '@nesso/i18n', '@nesso/shared-types'],
  // Allow LAN access for dev. Without this, Next.js 15 blocks server actions
  // posted from anything other than the host the dev server was started on
  // (e.g. opening http://192.168.1.4:3001/login from your phone makes the
  // Sign-in submit silently fail). Add more origins here if you test from
  // other devices/IPs.
  allowedDevOrigins: ['192.168.1.4', '*.local'],
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  org: 'harshimos-team',
  project: 'nesso-web',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
  tunnelRoute: '/monitoring',
  reactComponentAnnotation: { enabled: true },
});
