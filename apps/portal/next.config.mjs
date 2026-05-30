import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@nesso/design-system', '@nesso/i18n'],
  // Allow LAN access for dev (same reason as the web app).
  allowedDevOrigins: ['192.168.1.4', '*.local'],
  // Lint runs as a dedicated CI job; don't fail the production build on
  // ESLint content rules (the repo has no flat-config story yet). Types
  // are still enforced — the typecheck job + tsc gate that separately.
  eslint: { ignoreDuringBuilds: true },
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
  project: 'nesso-portal',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
  tunnelRoute: '/monitoring',
  reactComponentAnnotation: { enabled: true },
});
