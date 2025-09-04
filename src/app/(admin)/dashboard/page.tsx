'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Package, Tag, Users, LogOut, User } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, signOut, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    projects: 0,
    items: 0,
    brands: 0,
    users: 0,
  })

  // 사용자 정보가 로드될 때까지 기다림
  useEffect(() => {
    console.log('Dashboard useEffect:', { loading, user: !!user, profileStatus: user?.profile?.status })

    if (!loading && !user) {
      console.log('No user, redirecting to login')
      router.push('/login')
      return
    }

    if (user?.profile?.status !== 'approved') {
      console.log('User not approved, status:', user?.profile?.status)
      router.push('/login?error=unauthorized')
      return
    }

    console.log('User approved, loading dashboard')

    // 통계 데이터 로드 (실제로는 API 호출)
    setStats({
      projects: 3,
      items: 5,
      brands: 5,
      users: 1,
    })
  }, [user, loading, router])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Failed to sign out:', error)
    }
  }

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

  if (!user) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">대시보드</h1>
          <p className="text-muted-foreground">
            Design4Public 콘텐츠 관리 시스템에 오신 것을 환영합니다.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{user.email}</span>
            <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
              {user.profile?.role === 'master' ? '마스터' :
               user.profile?.role === 'admin' ? '관리자' : '일반'}
            </span>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            로그아웃
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">프로젝트</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.projects}</div>
            <p className="text-xs text-muted-foreground">
              등록된 프로젝트 수
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">아이템</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.items}</div>
            <p className="text-xs text-muted-foreground">
              등록된 가구 아이템 수
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">브랜드</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.brands}</div>
            <p className="text-xs text-muted-foreground">
              등록된 브랜드 수
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">사용자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.users}</div>
            <p className="text-xs text-muted-foreground">
              승인된 사용자 수
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              최근 프로젝트
            </CardTitle>
            <CardDescription>
              최근 추가된 프로젝트 목록입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1">
                  <p className="text-sm font-medium">서울시청 민원실 리모델링</p>
                  <p className="text-xs text-muted-foreground">2024년 1월</p>
                </div>
                <Button variant="outline" size="sm" className="ml-3">
                  보기
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1">
                  <p className="text-sm font-medium">부산시립도서관 신축</p>
                  <p className="text-xs text-muted-foreground">2023년 12월</p>
                </div>
                <Button variant="outline" size="sm" className="ml-3">
                  보기
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              빠른 작업
            </CardTitle>
            <CardDescription>
              자주 사용하는 기능들입니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start hover:bg-primary/5" variant="outline" asChild>
              <Link href="/projects/new">
                <FileText className="mr-2 h-4 w-4" />
                새 프로젝트 추가
              </Link>
            </Button>
            <Button className="w-full justify-start hover:bg-primary/5" variant="outline" asChild>
              <Link href="/items/new">
                <Package className="mr-2 h-4 w-4" />
                새 아이템 추가
              </Link>
            </Button>
            <Button className="w-full justify-start hover:bg-primary/5" variant="outline" asChild>
              <Link href="/brands/new">
                <Tag className="mr-2 h-4 w-4" />
                새 브랜드 추가
              </Link>
            </Button>
            <Button className="w-full justify-start hover:bg-primary/5" variant="outline" asChild>
              <Link href="/tags/new">
                <Tag className="mr-2 h-4 w-4" />
                새 태그 추가
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
