import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@mediapipe/selfie_segmentation"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.freepik.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
