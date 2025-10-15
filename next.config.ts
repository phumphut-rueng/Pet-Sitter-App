import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  typedRoutes: true,

  images: {
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: true,
    loader: "default",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "example.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
    ],
  },

  async rewrites() {
    return [
      { source: "/profile", destination: "/account/profile" },
      { source: "/your-pet", destination: "/account/pet" },
      { source: "/booking-history", destination: "/account/bookings" },
      { source: "/sitter-profile", destination: "/account/sitter" },
    ];
  },
};

export default nextConfig;
