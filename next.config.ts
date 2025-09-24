import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,


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
