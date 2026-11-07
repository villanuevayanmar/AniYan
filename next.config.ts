import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "media.kitsu.app" }],
  },
  turbopack: { root: process.cwd() },
};
export default nextConfig;