import type { NextConfig } from "next";

// Lấy URL backend từ biến môi trường, fallback về localhost cho dev
const backendUrl =
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT?.replace("/graphql", "") ||
  "http://127.0.0.1:4000";

const nextConfig: NextConfig = {
  // Proxy /graphql requests to the NestJS backend
  // This keeps all browser requests on the same origin
  // so HttpOnly cookies (access_token, refresh_token) are sent automatically.
  async rewrites() {
    return [
      {
        source: "/graphql",
        destination: `${backendUrl}/graphql`,
      },
    ];
  },

  // Increase proxy timeout to 60s to handle slow Gemini AI responses
  // without ECONNRESET socket hang up
  experimental: {
    proxyTimeout: 60_000, // 60 seconds
  },
};

export default nextConfig;
