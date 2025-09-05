import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel 배포 최적화
  poweredByHeader: false,

  // TypeScript 설정
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint 설정
  eslint: {
    ignoreDuringBuilds: true,
  },

  // 이미지 최적화 설정
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // 환경별 설정
  ...(process.env.NODE_ENV === 'production' && {
    // 프로덕션 전용 설정
    compiler: {
      removeConsole: process.env.NODE_ENV === 'production',
    },
  }),
};

export default nextConfig;
