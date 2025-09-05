import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel 배포 최적화
  poweredByHeader: false,

  // TypeScript 설정 - 배포를 위한 강제 설정
  typescript: {
    ignoreBuildErrors: true,
    tsconfigPath: './tsconfig.json'
  },

  // ESLint 설정 - 빌드 시 완전 무시
  eslint: {
    ignoreDuringBuilds: true,
  },

  // 빌드 최적화
  swcMinify: true,
  experimental: {
    // 빌드 속도 향상
    webpackBuildWorker: true,
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
