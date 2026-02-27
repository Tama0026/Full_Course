import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy /graphql requests to the NestJS backend
  // This keeps all browser requests on the same origin
  // so HttpOnly cookies (access_token, refresh_token) are sent automatically.
  async rewrites() {
    return [
      {
        source: "/graphql",
        destination: "http://127.0.0.1:4000/graphql",
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
