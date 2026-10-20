import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typedRoutes: false,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    // NEXT_PUBLIC_API_URL is http://localhost:8000/api/v1 — extract base backend URL
    // The source /api/:path* should proxy to http://localhost:8000/api/:path*
    const backendBase =
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      (process.env.NEXT_PUBLIC_API_URL
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/v\d+$/, "")
        : "http://localhost:8000");
    return [
      {
        source: "/api/:path*",
        destination: `${backendBase}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
