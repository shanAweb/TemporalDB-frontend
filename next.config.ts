import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy /api requests to the backend to avoid CORS issues in development
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
