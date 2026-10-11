import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/api/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
  outputFileTracingIncludes: { "/*": ["./db/migrations/*.sql"] },
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
