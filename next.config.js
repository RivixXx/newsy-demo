/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.supabase.in' },
    ],
  },
  optimizePackageImports: ['lucide-react', '@tabler/icons-react'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' 'wasm-unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' https://images.unsplash.com https://*.supabase.co https://*.supabase.in https://picsum.photos https://api.dicebear.com https://www.gstatic.com data: blob:",
              "font-src 'self'",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.gstatic.com blob:",
              "frame-ancestors 'none'",
            ].join('; '),
          },
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
