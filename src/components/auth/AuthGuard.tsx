'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireAuth } from '@/lib/auth-context'
import { Card, Text, Button, Banner } from '@shopify/polaris'

interface AuthGuardProps {
  children: ReactNode
  requireApproval?: boolean
  requiredRole?: 'master' | 'admin' | 'general'
}

export function AuthGuard({
  children,
  requireApproval = true,
  requiredRole
}: AuthGuardProps) {
  const { user, profile, loading, isAuthenticated, isApproved, isMaster, isAdmin, isGeneral } = useRequireAuth()
  const router = useRouter()

  // 로딩 중일 때는 아무것도 표시하지 않음
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <div className="p-8 text-center">
            <Text variant="headingMd" as="h2">
              로딩 중...
            </Text>
          </div>
        </Card>
      </div>
    )
  }

  // 로그인하지 않은 경우
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <div className="p-8 text-center">
            <Text variant="headingMd" as="h2" color="critical">
              접근 권한이 없습니다
            </Text>
            <div className="mt-4">
              <Text variant="bodyMd">
                이 페이지에 접근하려면 로그인이 필요합니다.
              </Text>
            </div>
            <div className="mt-6">
              <Button primary onClick={() => router.push('/auth')}>
                로그인하기
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // 승인 대기중인 경우
  if (requireApproval && profile?.status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <div className="p-8 text-center">
            <Text variant="headingMd" as="h2" color="warning">
              승인 대기 중
            </Text>
            <div className="mt-4">
              <Text variant="bodyMd">
                관리자의 승인을 기다리고 있습니다.
                <br />
                승인 완료 후에 서비스를 이용하실 수 있습니다.
              </Text>
            </div>
            <div className="mt-6">
              <Button onClick={() => router.push('/pending')}>
                대기 페이지로 이동
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // 거부된 경우
  if (profile?.status === 'rejected') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <div className="p-8 text-center">
            <Text variant="headingMd" as="h2" color="critical">
              접근이 거부되었습니다
            </Text>
            <div className="mt-4">
              <Text variant="bodyMd">
                관리자에 의해 접근이 거부되었습니다.
                <br />
                자세한 사항은 관리자에게 문의해주세요.
              </Text>
            </div>
            <div className="mt-6">
              <Button onClick={() => router.push('/auth')}>
                로그인 페이지로 이동
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // 역할 권한 체크
  if (requiredRole) {
    const hasRequiredRole = (() => {
      switch (requiredRole) {
        case 'master':
          return isMaster
        case 'admin':
          return isMaster || isAdmin
        case 'general':
          return isMaster || isAdmin || isGeneral
        default:
          return false
      }
    })()

    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Card>
            <div className="p-8 text-center">
              <Text variant="headingMd" as="h2" color="critical">
                권한이 부족합니다
              </Text>
              <div className="mt-4">
                <Text variant="bodyMd">
                  이 기능에 접근하려면 {requiredRole} 권한이 필요합니다.
                  <br />
                  현재 권한: {profile?.role || '없음'}
                </Text>
              </div>
              <div className="mt-6">
                <Button onClick={() => router.back()}>
                  뒤로가기
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )
    }
  }

  return <>{children}</>
}

// 간단한 인증 체크 컴포넌트 (승인 상태만 체크)
export function RequireAuth({ children }: { children: ReactNode }) {
  return (
    <AuthGuard requireApproval={true}>
      {children}
    </AuthGuard>
  )
}

// 관리자 권한이 필요한 경우
export function RequireAdmin({ children }: { children: ReactNode }) {
  return (
    <AuthGuard requireApproval={true} requiredRole="admin">
      {children}
    </AuthGuard>
  )
}

// 마스터 권한이 필요한 경우
export function RequireMaster({ children }: { children: ReactNode }) {
  return (
    <AuthGuard requireApproval={true} requiredRole="master">
      {children}
    </AuthGuard>
  )
}