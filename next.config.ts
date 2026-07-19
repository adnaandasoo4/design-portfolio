import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // §A10: serve AVIF/WebP (Next's default is WebP-only)
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
