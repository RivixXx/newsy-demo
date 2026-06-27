/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  serverExternalPackages: ['node:crypto'],
  async redirects() {
    return [
      // Policies & legal
      { source: '/privacy', destination: '/404', permanent: false },
      { source: '/terms', destination: '/404', permanent: false },
      { source: '/refund', destination: '/404', permanent: false },
      { source: '/rules', destination: '/404', permanent: false },
      // Placeholder features
      { source: '/favorites', destination: '/404', permanent: false },
      { source: '/referral', destination: '/404', permanent: false },
      { source: '/finance', destination: '/404', permanent: false },
      { source: '/help', destination: '/404', permanent: false },
      { source: '/brand-profile', destination: '/404', permanent: false },
      { source: '/analytics', destination: '/404', permanent: false },
      { source: '/api-docs', destination: '/404', permanent: false },
    ];
  },
};

module.exports = nextConfig;
