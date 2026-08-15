import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "*.space-z.ai",
    "*.chatglm.cn",
    "*.z.ai",
  ],
};

export default nextConfig;
