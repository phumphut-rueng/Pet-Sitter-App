import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,

  images: {
    formats: ['image/avif', 'image/webp' ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: true, // Disable optimization for problematic images
    loader: 'default',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },  
    ],
  },

  async rewrites() {
    return [
      { source: '/profile',          destination: '/account/profile'  },
      { source: '/your-pet',         destination: '/account/pet'      },
      { source: '/booking-history',  destination: '/account/bookings' },
      { source: '/sitter-profile',   destination: '/account/sitter'   },
    ];
  },
};

module.exports = nextConfig;
export default nextConfig;
