import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* Transpile leaflet for SSR compatibility */
  transpilePackages: ['leaflet', 'react-leaflet'],
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
