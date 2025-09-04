import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // 현재 세션 확인
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 보호된 라우트 목록
  const protectedRoutes = ['/dashboard', '/projects', '/items', '/brands', '/tags', '/users']
  const authRoutes = ['/login', '/signup']

  const isProtectedRoute = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => req.nextUrl.pathname.startsWith(route))

  // 보호된 라우트에 접근하려는데 로그인하지 않은 경우
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // 이미 로그인한 사용자가 로그인/회원가입 페이지에 접근하려는 경우
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // 사용자 프로필 확인 (profiles 테이블에 존재하는지)
  if (session && isProtectedRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('status, role')
      .eq('id', session.user.id)
      .single()

    // 프로필이 없거나 승인되지 않은 경우
    if (!profile || profile.status !== 'approved') {
      return NextResponse.redirect(new URL('/login?error=unauthorized', req.url))
    }

    // 마스터 전용 페이지 접근 제어
    if (req.nextUrl.pathname.startsWith('/users') && profile.role !== 'master') {
      return NextResponse.redirect(new URL('/dashboard?error=forbidden', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
