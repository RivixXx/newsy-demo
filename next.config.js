/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Policies & legal
      { source: '/privacy', destination: '/404', permanent: false },
      { source: '/terms', destination: '/404', permanent: false },
      { source: '/refund', destination: '/404', permanent: false },
      { source: '/rules', destination: '/404', permanent: false },
      // Placeholder features
      { source: '/favorites', destination: '/404', permanent: false },
      { source: '/finance', destination: '/404', permanent: false },
      { source: '/help', destination: '/404', permanent: false },
      { source: '/brand-profile', destination: '/404', permanent: false },
      { source: '/analytics', destination: '/404', permanent: false },
      { source: '/api-docs', destination: '/404', permanent: false },
    ];
  },
};

module.exports = nextConfig;
