import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel 배포 최적화
  poweredByHeader: false,

  // TypeScript 및 ESLint 설정
  typescript: {
    ignoreBuildErrors: false,
  },

  eslint: {
    ignoreDuringBuilds: true, // 빌드 중 ESLint 완전 무시
  },

  // 이미지 최적화 설정
  images: {
    domains: ['localhost'],
    unoptimized: true, // Vercel에서 이미지 최적화 비활성화 (필요시)
  },

  // 실험적 기능
  experimental: {
    // Turbopack 사용 (더 빠른 빌드)
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // 환경별 설정
  ...(process.env.NODE_ENV === 'production' && {
    // 프로덕션 전용 설정
    compiler: {
      removeConsole: false, // 개발 중에는 console 유지
    },
  }),
};

export default nextConfig;
