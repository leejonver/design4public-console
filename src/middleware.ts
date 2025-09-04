import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/database'

// 보호할 라우트 패턴들
const protectedRoutes = [
  '/dashboard',
  '/projects',
  '/items',
  '/brands',
  '/tags',
  '/users'
]

// 공개 라우트 패턴들 (로그인하지 않아도 접근 가능)
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/verify'
]

// 관리자 전용 라우트
const adminRoutes = [
  '/users'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 공개 라우트는 인증 체크 생략
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Supabase 클라이언트 생성
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll().map(cookie => ({
            name: cookie.name,
            value: cookie.value,
          }))
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  try {
    // 세션 확인
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('세션 확인 오류:', sessionError)
    }

    // 보호된 라우트에 대한 인증 확인
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

    if (isProtectedRoute) {
      if (!session) {
        // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }

      // 사용자 프로필 확인 (역할 및 상태)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('id', session.user.id)
        .single()

      if (profileError) {
        console.error('프로필 조회 오류:', profileError)
        // 프로필 조회 실패 시 로그인 페이지로 리다이렉트
        const loginUrl = new URL('/login', request.url)
        return NextResponse.redirect(loginUrl)
      }

      // 사용자 상태 확인
      if (profile.status === 'pending') {
        // 승인 대기 중인 경우 대시보드로 리다이렉트 (승인 대기 메시지 표시)
        const dashboardUrl = new URL('/dashboard', request.url)
        dashboardUrl.searchParams.set('message', 'pending_approval')
        return NextResponse.redirect(dashboardUrl)
      }

      if (profile.status === 'rejected') {
        // 거부된 사용자는 접근 불가
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('error', 'account_rejected')
        return NextResponse.redirect(loginUrl)
      }

      // 관리자 전용 라우트에 대한 역할 확인
      const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

      if (isAdminRoute && profile.role !== 'master') {
        // 마스터 권한이 없는 경우 접근 거부
        const dashboardUrl = new URL('/dashboard', request.url)
        dashboardUrl.searchParams.set('error', 'insufficient_permissions')
        return NextResponse.redirect(dashboardUrl)
      }

      // 일반 사용자에 대한 추가적인 라우트 제한
      if (profile.role === 'general') {
        // 일반 사용자는 사용자 관리 페이지에 접근할 수 없음
        if (pathname.startsWith('/users')) {
          const dashboardUrl = new URL('/dashboard', request.url)
          dashboardUrl.searchParams.set('error', 'insufficient_permissions')
          return NextResponse.redirect(dashboardUrl)
        }
      }
    }

    return response
  } catch (error) {
    console.error('미들웨어 오류:', error)

    // 오류 발생 시 로그인 페이지로 리다이렉트
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('error', 'auth_error')
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
