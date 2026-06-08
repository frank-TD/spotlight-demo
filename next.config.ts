import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Sample imagery is served from picsum (which redirects to its fastly CDN).
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
    ],
  },
};

export default nextConfig;
