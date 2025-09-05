# 🎨 Design4Public CMS

공공조달 가구 케이스 스터디 관리 시스템

![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)

## 🚀 빠른 시작

### 로컬 개발 환경 설정

1. **의존성 설치**
```bash
npm install
```

2. **환경 변수 설정**
```bash
# .env.local 파일 생성 및 설정
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

3. **개발 서버 실행**
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 🏗️ 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx          # 메인 페이지
│   └── globals.css       # 글로벌 스타일
├── components/            # React 컴포넌트
├── lib/
│   └── utils.ts          # 유틸리티 함수
└── types/                 # TypeScript 타입 정의
```

## 🔧 기술 스택

- **Next.js 15** - React 기반 풀스택 프레임워크
- **TypeScript** - 정적 타입 지원
- **Tailwind CSS** - 유틸리티 퍼스트 CSS 프레임워크
- **Supabase** - PostgreSQL 기반 BaaS

---

**Design4Public CMS** - 공공조달 가구 케이스 스터디를 효율적으로 관리하세요! 🎨
