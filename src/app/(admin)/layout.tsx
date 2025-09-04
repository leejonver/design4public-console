'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Package,
  Tag,
  Users,
  Menu,
  X,
  Home,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: '대시보드', href: '/dashboard', icon: Home },
  { name: '프로젝트', href: '/projects', icon: FileText },
  { name: '아이템', href: '/items', icon: Package },
  { name: '브랜드', href: '/brands', icon: Tag },
  { name: '태그', href: '/tags', icon: Tag },
  { name: '사용자 관리', href: '/users', icon: Users, masterOnly: true },
  { name: '설정', href: '/settings', icon: Settings },
]

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      console.log('Admin layout: No user, redirecting to login')
      router.push('/login?redirectTo=' + encodeURIComponent(pathname))
      return
    }

    if (user?.profile?.status !== 'approved') {
      console.log('Admin layout: User not approved, status:', user?.profile?.status)
      router.push('/login?error=unauthorized')
      return
    }

    console.log('Admin layout: User approved, proceeding')
  }, [user, loading, router, pathname])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!user || user?.profile?.status !== 'approved') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>권한 확인 중...</p>
        </div>
      </div>
    )
  }

  const filteredNavigation = navigation.filter(item => {
    // 마스터 전용 메뉴 필터링
    if (item.masterOnly && user.profile?.role !== 'master') {
      return false
    }
    return true
  })

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 모바일 사이드바 오버레이 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-600/75 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 border-r",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* 로고 */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-slate-200">
            <h1 className="text-xl font-bold text-primary">Design4Public</h1>
          </div>

          {/* 네비게이션 */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* 사용자 정보 */}
          <div className="p-4 border-t border-slate-200">
            <div className="flex items-center">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {user.email}
                </p>
                <p className="text-xs text-slate-500">
                  {user.profile?.role === 'master' ? '마스터' :
                   user.profile?.role === 'admin' ? '관리자' : '일반'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="lg:pl-64">
        {/* 모바일 헤더 */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 bg-white px-4 shadow-sm lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="-m-2.5 p-2.5 text-slate-700"
          >
            <span className="sr-only">메뉴 열기</span>
            <Menu className="h-6 w-6" />
          </Button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-lg font-semibold text-slate-900">Design4Public Console</h1>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 영역 */}
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
