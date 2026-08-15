import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Vercel deployment
  output: 'standalone',
  
  // Enable experimental features if needed
  experimental: {
    // serverComponents: true, // Already enabled by default in Next.js 13+
  },
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};

export default nextConfig;
