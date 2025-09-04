## 1. 프로젝트 개요 (Project Overview)

### 1.1. 프로젝트 목표 (Goal)

`design4public.com` (메인 사이트)에 필요한 공공 조달 가구 납품 사례 콘텐츠를 운영자가 효율적으로 생성(Create), 조회(Read), 수정(Update), 삭제(Delete)할 수 있는 웹 기반 콘텐츠 관리 시스템(CMS)을 구축한다.

### 1.2. 타겟 사용자 (Target User)

- **마스터 (Master):** 사이트의 모든 콘텐츠와 사용자 계정(승인, 역할 변경)을 관리하는 최고 관리자.

- **관리자 (Admin):** 사용자 계정을 제외한 모든 콘텐츠(프로젝트, 아이템 등)를 관리하는 운영자.

- **일반 (General):** 콘텐츠의 생성 및 수정 권한만 가진 일반 사용자.


## 2. 시스템 아키텍쳐 (System Architecture)

### 2.1. 기술 스택 (Tech Stack)

- **Frontend:** Next.js, TypeScript, Tailwind CSS

- **Backend & Services:** Supabase (PostgreSQL, Authentication, Storage)

- **Deployment:** Vercel

- **Version Control:** Github


### 2.2. 시스템 구성도

```
graph TD
    subgraph "사용자 영역"
        A[메인 사이트 유저] --> B{design4public.com};
        C[CMS 운영자] --> D{console.design4public.com};
    end

    subgraph "Vercel"
        B -- Read-Only --> E{Supabase};
        D -- CRUD --> E;
    end

    subgraph "Supabase"
        E --- F[Database (PostgreSQL)];
        E --- G[Authentication];
        E --- H[Storage];
    end

    I[Github Repository] -- CI/CD --> B & D;
    C -- Login --> G;
```

## 3. 데이터베이스 스키마 (Database Schema)

### 3.1. `profiles` (사용자 프로필 및 역할)

`auth.users` 테이블과 1:1로 연결하여 역할과 계정 상태를 관리합니다.

|   |   |   |   |
|---|---|---|---|
|**컬럼명**|**데이터 타입**|**설명**|**제약조건**|
|`id`|`uuid`|사용자 ID|**Primary Key**, Foreign Key (`auth.users.id`)|
|`email`|`text`|사용자 이메일|Not Null, Unique|
|`role`|`text`|사용자 역할|Not Null, Check (`master`, `admin`, `general`)|
|`status`|`text`|계정 상태|Not Null, Check (`pending`, `approved`, `rejected`)|

### 3.2. `projects` (프로젝트)

|   |   |   |   |
|---|---|---|---|
|**컬럼명**|**데이터 타입**|**설명**|**제약조건**|
|`id`|`uuid`|고유 식별자|**Primary Key**|
|`title`|`text`|프로젝트명|Not Null|
|`description`|`text`|프로젝트 설명|Nullable|
|`cover_image_url`|`text`|커버 이미지 URL|Nullable|
|`year`|`integer`|준공 연도|Nullable|
|`area`|`numeric`|면적 (m²)|Nullable|
|`status`|`text`|게시 상태|Not Null, Check (`draft`, `published`, `hidden`)|
|`created_at`|`timestamptz`|생성 시각|`now()`|

### 3.3. `items` (아이템)

|   |   |   |   |
|---|---|---|---|
|**컬럼명**|**데이터 타입**|**설명**|**제약조건**|
|`id`|`uuid`|고유 식별자|**Primary Key**|
|`name`|`text`|아이템명|Not Null|
|`description`|`text`|아이템 설명|Nullable|
|`brand_id`|`uuid`|브랜드 ID|Foreign Key (`brands.id`)|
|`nara_url`|`text`|나라장터 URL|Nullable|
|`image_url`|`text`|아이템 대표 사진 URL|Nullable|

### 3.4. `brands` (브랜드)

|   |   |   |   |
|---|---|---|---|
|**컬럼명**|**데이터 타입**|**설명**|**제약조건**|
|`id`|`uuid`|고유 식별자|**Primary Key**|
|`name`|`text`|브랜드명|Not Null, Unique|
|`description`|`text`|브랜드 설명|Nullable|
|`cover_image_url`|`text`|브랜드 커버 이미지 URL|Nullable|
|`website_url`|`text`|브랜드 웹사이트 URL|Nullable|

### 3.5. `tags` (태그)

|   |   |   |   |
|---|---|---|---|
|**컬럼명**|**데이터 타입**|**설명**|**제약조건**|
|`id`|`uuid`|고유 식별자|**Primary Key**|
|`name`|`text`|태그명|Not Null, Unique|

### 3.6. `project_images` (프로젝트 이미지)

|   |   |   |   |
|---|---|---|---|
|**컬럼명**|**데이터 타입**|**설명**|**제약조건**|
|`id`|`uuid`|고유 식별자|**Primary Key**|
|`project_id`|`uuid`|프로젝트 ID|Foreign Key (`projects.id`)|
|`image_url`|`text`|이미지 URL|Not Null|
|`order`|`integer`|정렬 순서|Nullable|

### 3.7. 연결 테이블 (Junction Tables)

- **`project_items`**: `projects.id` - `items.id` (N:M)

- **`project_tags`**: `projects.id` - `tags.id` (N:M)

- **`image_tags`**: `project_images.id` - `tags.id` (N:M)


## 4. 화면별 상세 기획 (Page Specifications)

### 4.1. 인증 (Authentication)

- **회원가입 (`/signup`)**: 이메일/비밀번호 입력. 가입 후 "이메일 인증 후 관리자 승인이 필요합니다" 안내.

- **로그인 (`/login`)**: 이메일/비밀번호로 로그인. 미승인/거절된 사용자는 접근 불가.


### 4.2. 공통 레이아웃 (Common Layout)

- **사이드 네비게이션**: `프로젝트`, `아이템`, `브랜드`, `태그`, `사용자 관리` (`master` 전용)

- **헤더**: 로그인한 사용자 정보, 로그아웃 버튼


### 4.3. 페이지별 기능

- **프로젝트 관리 (`/projects`)**

    - **리스트 뷰**: 프로젝트 목록 테이블, '새 프로젝트 추가' 버튼.

    - **입력/상세 뷰**: 프로젝트 기본 정보 폼, 커버/갤러리 이미지 업로더, **각 갤러리 이미지별 태그 입력 기능**, 프로젝트 전체 태그 입력 기능, 사용된 아이템 검색/추가 기능.

- **아이템 관리 (`/items`)**

    - **리스트 뷰**: 아이템 목록 테이블, '새 아이템 추가' 버튼.

    - **입력/상세 뷰**: 아이템 정보 폼, 브랜드 선택 드롭다운.

- **브랜드 관리 (`/brands`)**: 브랜드 정보(이름, 설명, 로고 등) CRUD.

- **태그 관리 (`/tags`)**: 태그 생성, 수정, 삭제 CRUD.

- **사용자 관리 (`/users`)** - `master` 전용

    - **리스트 뷰**: 사용자 목록 테이블 (이메일, 역할, 상태 표시).

    - **기능**: 사용자 계정 상태(`pending` -> `approved`) 변경, 역할 변경, 계정 삭제.


## 5. UI/UX 디자인 가이드 (UI/UX Design Guide)

### 5.1. 디자인 원칙

- **효율성 (Efficiency):** 최소한의 클릭과 동선으로 작업을 완료할 수 있도록 설계.

- **명확성 (Clarity):** 모든 UI 요소와 정보는 명확하게 인지 가능해야 함.

- **일관성 (Consistency):** 사이트 전체에 걸쳐 일관된 디자인 시스템 적용.


### 5.2. 비주얼 아이덴티티

- **Color Palette:**

    - **Primary:** `#2563EB` (Blue) - 핵심 상호작용

    - **Grayscale:** `#F8FAFC` ~ `#020617` (Slate) - 배경, 텍스트, 보더

    - **Semantic:** Green(성공), Red(오류/삭제), Amber(경고)

- **Typography:** `Pretendard` (가독성 높은 한글/영문 서체)

- **Iconography:** `Lucide-React` (모던하고 일관된 아이콘 셋)

- **레퍼런스:** , Stripe Dashboard


### 5.3. 레이아웃 및 간격

- **기본 레이아웃:** 좌측 고정 사이드 네비게이션 + 우측 메인 콘텐츠 2단 레이아웃.

- **Spacing System:** 4px 기반의 배수 시스템 (Tailwind CSS 기본값 활용).


## 6. 개발 가이드 (Development Guide)

### 6.1. 폴더 구조 (Folder Structure)

코드의 일관성과 예측 가능성을 위해 아래 폴더 구조를 준수한다.

```
src/
├── app/                  # 페이지 라우팅
│   ├── (admin)/          # 관리자 공통 레이아웃 그룹
│   │   ├── layout.tsx
│   │   ├── projects/
│   │   └── ...
│   └── (auth)/           # 인증 관련 레이아웃 그룹
├── components/           # 재사용 UI 컴포넌트
│   ├── ui/               # 원자 단위 (Button, Input)
│   └── features/         # 기능 단위 (ProjectForm)
├── lib/                  # 라이브러리, 헬퍼 함수
│   └── supabaseClient.ts
├── services/             # 데이터베이스 통신 로직
│   └── projectService.ts
└── types/                # TypeScript 타입 정의
    └── database.ts       # Supabase 자동 생성 타입
```

### 6.2. 데이터 로직 분리 (Data Fetching Layer)

UI 컴포넌트에서 직접 Supabase 클라이언트를 호출하지 않는다. 모든 데이터베이스 통신은 `src/services/` 디렉토리 내의 서비스 함수를 통해 이루어져야 한다.

- **Good 👍**: 서비스를 통해 데이터 호출

    ```
// src/services/projectService.ts
    import { supabase } from '@/lib/supabaseClient';
    export const getProjects = async () => { /* ... */ };

// src/app/projects/page.tsx
    import { getProjects } from '@/services/projectService';
    const projects = await getProjects();
    ```


### 6.3. 상태 관리 전략 (State Management)

- **Local State:** `useState`

- **Complex Form State:** `react-hook-form` 라이브러리 사용 권장.

- **Global State:** `React Context` (로그인 사용자 정보 등)


### 6.4. TypeScript 활용 (TypeScript Usage)

Supabase CLI를 사용하여 데이터베이스 스키마로부터 타입을 자동 생성하고, 프로젝트 전반에 적극적으로 활용하여 타입 안정성을 확보한다.

```
npx supabase gen types typescript --project-id <YOUR_PROJECT_ID> > src/types/database.ts
```
