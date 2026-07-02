import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // Sample imagery is served from picsum (which redirects to its fastly CDN).
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
    ],
  },
  async redirects() {
    return [
      // Discover merged into the Marketplace — keep the old path working.
      // Exact match, so /discovery/workspace (the AIGC Studio) is untouched.
      { source: "/discovery", destination: "/market", permanent: false },
    ];
  },
};

export default nextConfig;
