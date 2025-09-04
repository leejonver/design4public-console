'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Loader2, Shield, Users, FolderOpen, Settings } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      // 로그인된 경우 대시보드로 리다이렉트
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (user) {
    // 로그인된 경우 잠시 로딩 표시 후 대시보드로 리다이렉트
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">대시보드로 이동 중...</p>
        </div>
      </div>
    )
  }

  // 로그인되지 않은 경우 웰컴 페이지 표시
  return (
    <div className="min-h-screen bg-slate-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">Design4Public Console</h1>
            </div>
            <div className="flex space-x-4">
              <Link href="/login">
                <Button variant="outline">로그인</Button>
              </Link>
              <Link href="/signup">
                <Button>회원가입</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* 히어로 섹션 */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            디자인4퍼블릭 콘텐츠 관리 시스템
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            공공시설 가구 사례 연구 콘텐츠를 효율적으로 관리하고,
            전문적인 방식으로 콘텐츠를 구성하는 종합 관리 플랫폼입니다.
          </p>
          <Link href="/login">
            <Button size="lg" className="px-8 py-3">
              콘솔 시작하기
            </Button>
          </Link>
        </div>

        {/* 기능 소개 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <FolderOpen className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>프로젝트 관리</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                공공시설 가구 프로젝트를 체계적으로 관리하고,
                이미지와 상세 정보를 효과적으로 구성합니다.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>아이템 관리</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                각 프로젝트에 사용된 가구 아이템을 브랜드별로
                체계적으로 분류하고 관리합니다.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>브랜드 관리</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                협력하는 브랜드 정보를 관리하고,
                로고와 브랜드 정보를 통합적으로 관리합니다.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Settings className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>태그 시스템</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                프로젝트와 이미지를 태그로 분류하여
                효율적인 검색과 필터링을 지원합니다.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* 특징 소개 */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              왜 Design4Public Console을 선택해야 할까요?
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <h4 className="text-xl font-semibold text-gray-900 mb-2">효율적인 관리</h4>
              <p className="text-gray-600">
                직관적인 인터페이스로 복잡한 콘텐츠를 쉽고 빠르게 관리할 수 있습니다.
              </p>
            </div>

            <div className="text-center">
              <h4 className="text-xl font-semibold text-gray-900 mb-2">안전한 데이터</h4>
              <p className="text-gray-600">
                Supabase를 기반으로 한 안정적인 데이터베이스로 데이터 보안을 보장합니다.
              </p>
            </div>

            <div className="text-center">
              <h4 className="text-xl font-semibold text-gray-900 mb-2">실시간 협업</h4>
              <p className="text-gray-600">
                여러 관리자가 동시에 작업할 수 있는 실시간 협업 환경을 제공합니다.
              </p>
            </div>
          </div>
        </div>

        {/* CTA 섹션 */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            지금 바로 시작하세요
          </h3>
          <p className="text-gray-600 mb-8">
            Design4Public Console로 효율적인 콘텐츠 관리를 경험해보세요.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/login">
              <Button size="lg" className="px-8">
                로그인하기
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="outline" className="px-8">
                회원가입하기
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Shield className="h-6 w-6" />
              <span className="text-xl font-bold">Design4Public Console</span>
            </div>
            <p className="text-gray-400">
              © 2024 Design4Public. 모든 권리 보유.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
