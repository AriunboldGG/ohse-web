import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Using Turbopack only (Next.js 16)
  // External packages for server components to avoid bundling issues
  serverExternalPackages: ['@firebase/app', '@firebase/firestore', '@firebase/util', '@firebase/storage'],
  // Allow images from Firebase Storage
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleapis.com',
      },
    ],
  },
};

export default nextConfig;
