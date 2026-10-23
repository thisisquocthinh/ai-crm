import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // zca-js dùng WebSocket và module Node, không đóng gói qua bundler.
  serverExternalPackages: ["zca-js"],
};

export default nextConfig;
