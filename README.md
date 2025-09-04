# 🎨 Design4Public CMS

공공조달 가구 케이스 스터디 관리 시스템

![Design4Public](https://img.shields.io/badge/Design4Public-CMS-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14.0-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-2.0-green?style=flat-square&logo=supabase)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=flat-square&logo=vercel)

## 📋 프로젝트 개요

Design4Public은 공공조달 가구 케이스 스터디를 관리하는 현대적인 콘텐츠 관리 시스템입니다.

### ✨ 주요 기능

- **📊 프로젝트 관리**: CRUD + 갤러리 이미지 + 관계 관리
- **🪑 아이템 관리**: 가구 정보 + 브랜드 연결 + 이미지 업로드
- **🏢 브랜드 관리**: 브랜드 정보 + 커버 이미지
- **🏷️ 태그 관리**: 프로젝트/이미지 분류 시스템
- **👥 사용자 관리**: 마스터 권한 기반 사용자 관리
- **🖼️ 이미지 관리**: Supabase Storage 연동 파일 업로드
- **🔗 관계 관리**: 프로젝트-아이템, 프로젝트-태그, 이미지-태그 연결

### 🎯 사용자 역할

- **마스터**: 모든 권한 (사용자 관리, 시스템 설정)
- **관리자**: 콘텐츠 관리 (프로젝트, 아이템, 브랜드, 태그)
- **일반**: 조회 권한 (프로젝트 열람)

## 🚀 빠른 시작

### 로컬 개발 환경 설정

1. **리포지토리 클론**
```bash
git clone https://github.com/leejonver/design4public-console.git
cd design4public-console
```

2. **의존성 설치**
```bash
npm install
```

3. **환경 변수 설정**
```bash
cp .env.local.example .env.local
```

환경 변수 파일에 다음 값들을 설정하세요:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **데이터베이스 설정**
```bash
# Supabase CLI 설치
npm install -g supabase

# 로컬 Supabase 시작
supabase start

# 마이그레이션 실행
supabase db reset
```

5. **개발 서버 실행**
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 🏗️ 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── (admin)/           # 관리자 페이지들
│   ├── (auth)/            # 인증 페이지들
│   └── api/               # API 라우트
├── components/            # React 컴포넌트
│   ├── features/          # 기능별 컴포넌트
│   └── ui/                # UI 컴포넌트
├── lib/                   # 유틸리티 함수
├── services/              # 서비스 레이어
├── types/                 # TypeScript 타입 정의
└── hooks/                 # 커스텀 훅
```

## 🔧 기술 스택

### Frontend
- **Next.js 14** - React 기반 풀스택 프레임워크
- **TypeScript** - 정적 타입 지원
- **Tailwind CSS** - 유틸리티 퍼스트 CSS 프레임워크
- **shadcn/ui** - 모던 UI 컴포넌트 라이브러리

### Backend
- **Supabase** - PostgreSQL 기반 BaaS
- **NextAuth.js** - 인증 시스템
- **Prisma** - 데이터베이스 ORM (선택적)

### DevOps
- **Vercel** - 배포 플랫폼
- **GitHub Actions** - CI/CD 파이플라인
- **ESLint** - 코드 품질 관리

## 🚀 배포

### Vercel 자동 배포

1. **GitHub 리포지토리 연결**
   - Vercel 대시보드에서 새 프로젝트 생성
   - GitHub 리포지토리 연결

2. **환경 변수 설정**
   - Vercel 프로젝트 설정에서 다음 환경 변수 추가:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. **빌드 설정**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Node.js Version: `18.x`

### 수동 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# Vercel 로그인
vercel login

# 프로젝트 배포
vercel

# 프로덕션 배포
vercel --prod
```

## 📊 데이터베이스 스키마

### 주요 테이블

- **profiles**: 사용자 프로필 정보
- **projects**: 프로젝트 정보
- **items**: 가구 아이템 정보
- **brands**: 브랜드 정보
- **tags**: 태그 정보
- **project_images**: 프로젝트 갤러리 이미지
- **project_items**: 프로젝트-아이템 관계
- **project_tags**: 프로젝트-태그 관계
- **image_tags**: 이미지-태그 관계

### 관계도

```
프로젝트 ──┬── 이미지 (갤러리)
          ├── 아이템 (사용된 가구)
          └── 태그 (분류)

이미지 ──── 태그 (이미지별 태그)

아이템 ──── 브랜드 (제조사)
```

## 🧪 테스트 데이터

시드 데이터를 사용하여 테스트를 진행할 수 있습니다:

```bash
# Supabase 시드 데이터 적용
supabase db reset
```

테스트 데이터에는 다음이 포함됩니다:
- 샘플 브랜드 (Herman Miller, Vitra 등)
- 다양한 태그 (사무용의자, 책상, 병원 등)
- 실제 프로젝트 케이스 (서울시청, 부산도서관 등)
- 가구 아이템 및 관계 데이터

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 라이선스

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 연락처

프로젝트 관리자: [leejonver](https://github.com/leejonver)

---

**Design4Public CMS** - 공공조달 가구 케이스 스터디를 효율적으로 관리하세요! 🎨
