import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
  images: {
    qualities: [75, 90],
    remotePatterns: [
      { protocol: "https", hostname: "*.t3.storageapi.dev" },
      { protocol: "https", hostname: "t3.storageapi.dev" },
      { protocol: "https", hostname: "storage.railway.app" },
      { protocol: "https", hostname: "*.storage.railway.app" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
