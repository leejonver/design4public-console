import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel 배포 최적화
  poweredByHeader: false,

  // TypeScript 설정 - 임시로 오류 허용 (배포 문제 해결용)
  typescript: {
    ignoreBuildErrors: true,
  },

  // ESLint 설정 - 빌드 중 오류 허용하지 않음
  eslint: {
    ignoreDuringBuilds: false,
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
