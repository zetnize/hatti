import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: { "/*": ["./db/migrations/*.sql"] },
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
