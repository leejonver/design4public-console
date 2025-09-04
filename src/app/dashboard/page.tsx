'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth, useUserRole, useUserStatus } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PolarisCard, PolarisCardHeader, PolarisCardContent } from '@/components/ui/polaris-card'
import { PolarisButton } from '@/components/ui/polaris-button'
import { PolarisGrid } from '@/components/ui/polaris-layout'
import { Badge } from '@/components/ui/badge'
import { Loader2, Users, FolderOpen, Package, Building, Tag, LogOut, AlertTriangle, CheckCircle, Plus, Settings } from 'lucide-react'

function DashboardPageContent() {
  const { user, profile, signOut } = useAuth()
  const role = useUserRole()
  const status = useUserStatus()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [stats, setStats] = useState({
    projects: 0,
    items: 0,
    brands: 0,
    tags: 0
  })

  // URL 파라미터에서 메시지 확인
  const message = searchParams.get('message')
  const error = searchParams.get('error')

  useEffect(() => {
    // 통계 데이터 로드 (실제 구현 시 서비스 함수 호출)
    loadStats()
  }, [])

  const loadStats = async () => {
    // 임시 데이터 - 실제 구현 시 서비스 함수를 통해 데이터 로드
    setStats({
      projects: 0,
      items: 0,
      brands: 0,
      tags: 0
    })
  }

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('로그아웃 오류:', error)
    }
  }

  const getStatusMessage = () => {
    if (message === 'pending_approval') {
      return (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>승인 대기 중</strong><br />
            관리자의 승인을 기다리고 있습니다. 승인 완료까지 잠시만 기다려주세요.
          </AlertDescription>
        </Alert>
      )
    }

    if (error === 'insufficient_permissions') {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>권한 부족</strong><br />
            이 페이지에 접근할 권한이 없습니다.
          </AlertDescription>
        </Alert>
      )
    }

    return null
  }

  const getWelcomeMessage = () => {
    if (status === 'pending') {
      return {
        title: '승인 대기 중',
        description: '관리자의 승인을 기다리고 있습니다. 승인 완료 후 모든 기능을 사용할 수 있습니다.',
        icon: <AlertTriangle className="h-6 w-6 text-amber-600" />
      }
    }

    if (role === 'master') {
      return {
        title: '마스터 관리자님, 환영합니다!',
        description: '시스템의 모든 기능과 사용자 관리를 제어할 수 있습니다.',
        icon: <CheckCircle className="h-6 w-6 text-green-600" />
      }
    }

    if (role === 'admin') {
      return {
        title: '관리자님, 환영합니다!',
        description: '프로젝트, 아이템, 브랜드, 태그를 관리할 수 있습니다.',
        icon: <CheckCircle className="h-6 w-6 text-blue-600" />
      }
    }

    return {
      title: '환영합니다!',
      description: '콘텐츠를 생성하고 관리할 수 있습니다.',
      icon: <CheckCircle className="h-6 w-6 text-green-600" />
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-2 text-slate-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  const welcomeMessage = getWelcomeMessage()

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Status Message */}
      {getStatusMessage() && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {getStatusMessage()}
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Design4Public Console</h1>
              <p className="text-slate-600">콘텐츠 관리 시스템</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-slate-700 font-medium">
                  {user?.email}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={status === 'approved' ? 'default' : 'secondary'}>
                    {status === 'approved' ? '승인됨' : '승인 대기'}
                  </Badge>
                  <Badge variant="outline">
                    {role === 'master' ? '마스터' : role === 'admin' ? '관리자' : '일반'}
                  </Badge>
                </div>
              </div>
                          <PolarisButton
              onClick={handleLogout}
              variant="secondary"
              size="sm"
            >
              <LogOut className="mr-2 h-4 w-4" />
              로그아웃
            </PolarisButton>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Card */}
          <PolarisCard className="mb-8">
            <PolarisCardHeader>
              <div className="flex items-center space-x-3">
                {welcomeMessage.icon}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{welcomeMessage.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{welcomeMessage.description}</p>
                </div>
              </div>
            </PolarisCardHeader>
          </PolarisCard>

          {/* Stats Grid */}
          <PolarisGrid columns={4} gap="loose" className="mb-8">
            <PolarisCard>
              <PolarisCardHeader>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">프로젝트</h4>
                  <FolderOpen className="h-5 w-5 text-teal-600" />
                </div>
              </PolarisCardHeader>
              <PolarisCardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.projects}</div>
                <p className="text-sm text-gray-600">등록된 프로젝트</p>
              </PolarisCardContent>
            </PolarisCard>

            <PolarisCard>
              <PolarisCardHeader>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">아이템</h4>
                  <Package className="h-5 w-5 text-green-600" />
                </div>
              </PolarisCardHeader>
              <PolarisCardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.items}</div>
                <p className="text-sm text-gray-600">등록된 아이템</p>
              </PolarisCardContent>
            </PolarisCard>

            <PolarisCard>
              <PolarisCardHeader>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">브랜드</h4>
                  <Building className="h-5 w-5 text-purple-600" />
                </div>
              </PolarisCardHeader>
              <PolarisCardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.brands}</div>
                <p className="text-sm text-gray-600">등록된 브랜드</p>
              </PolarisCardContent>
            </PolarisCard>

            <PolarisCard>
              <PolarisCardHeader>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">태그</h4>
                  <Tag className="h-5 w-5 text-orange-600" />
                </div>
              </PolarisCardHeader>
              <PolarisCardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.tags}</div>
                <p className="text-sm text-gray-600">등록된 태그</p>
              </PolarisCardContent>
            </PolarisCard>
          </PolarisGrid>

          {/* Quick Actions */}
          <PolarisCard>
            <PolarisCardHeader
              title="빠른 작업"
              subtitle="자주 사용하는 기능에 빠르게 접근하세요"
            />
            <PolarisCardContent>
              <PolarisGrid columns={3} gap="loose">
                <PolarisButton
                  variant="secondary"
                  className="h-20 flex-col space-y-2"
                  onClick={() => router.push('/projects')}
                >
                  <FolderOpen className="h-6 w-6" />
                  <span>프로젝트 관리</span>
                </PolarisButton>

                <PolarisButton
                  variant="secondary"
                  className="h-20 flex-col space-y-2"
                  onClick={() => router.push('/items')}
                >
                  <Package className="h-6 w-6" />
                  <span>아이템 관리</span>
                </PolarisButton>

                <PolarisButton
                  variant="secondary"
                  className="h-20 flex-col space-y-2"
                  onClick={() => router.push('/brands')}
                >
                  <Building className="h-6 w-6" />
                  <span>브랜드 관리</span>
                </PolarisButton>

                {role === 'master' && (
                  <PolarisButton
                    variant="secondary"
                    className="h-20 flex-col space-y-2"
                    onClick={() => router.push('/users')}
                  >
                    <Users className="h-6 w-6" />
                    <span>사용자 관리</span>
                  </PolarisButton>
                )}

                <PolarisButton
                  variant="secondary"
                  className="h-20 flex-col space-y-2"
                  onClick={() => router.push('/tags')}
                >
                  <Tag className="h-6 w-6" />
                  <span>태그 관리</span>
                </PolarisButton>

                <PolarisButton
                  variant="outline"
                  className="h-20 flex-col space-y-2 border-dashed"
                  onClick={() => router.push('/projects')}
                >
                  <Plus className="h-6 w-6" />
                  <span>새 프로젝트</span>
                </PolarisButton>
              </PolarisGrid>
            </PolarisCardContent>
          </PolarisCard>
        </div>
      </main>
    </div>
  )
}

function DashboardPageFallback() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-teal-600" />
        <p className="mt-2 text-slate-600">로딩 중...</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardPageFallback />}>
      <DashboardPageContent />
    </Suspense>
  )
}
