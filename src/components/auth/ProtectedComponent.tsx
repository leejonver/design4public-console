'use client'

import { ReactNode } from 'react'
import { useAuthorization } from '@/hooks/useAuthorization'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Lock } from 'lucide-react'

interface ProtectedComponentProps {
  children: ReactNode
  permission?: string
  permissions?: string[]
  requireAll?: boolean // 모든 권한이 필요한지 여부
  role?: 'master' | 'admin' | 'general'
  roleOrHigher?: 'master' | 'admin' | 'general'
  requireApproval?: boolean
  fallback?: ReactNode
  showMessage?: boolean
}

/**
 * 권한에 따라 컴포넌트를 조건부로 렌더링하는 컴포넌트
 */
export function ProtectedComponent({
  children,
  permission,
  permissions,
  requireAll = false,
  role,
  roleOrHigher,
  requireApproval = false,
  fallback,
  showMessage = true
}: ProtectedComponentProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, hasRoleOrHigher, isApproved } = useAuthorization()

  // 권한 확인
  let hasAccess = true

  if (permission) {
    hasAccess = hasPermission(permission)
  } else if (permissions) {
    hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions)
  }

  if (role) {
    hasAccess = hasAccess && hasRole(role)
  }

  if (roleOrHigher) {
    hasAccess = hasAccess && hasRoleOrHigher(roleOrHigher)
  }

  if (requireApproval) {
    hasAccess = hasAccess && isApproved()
  }

  // 접근 권한이 없으면 폴백 표시
  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>
    }

    if (!showMessage) {
      return null
    }

    return (
      <Alert variant="destructive">
        <Lock className="h-4 w-4" />
        <AlertDescription>
          이 기능에 접근할 권한이 없습니다. 관리자에게 문의해주세요.
        </AlertDescription>
      </Alert>
    )
  }

  return <>{children}</>
}

interface PermissionGateProps extends Omit<ProtectedComponentProps, 'children'> {
  children: ReactNode
  inverse?: boolean // 권한이 없을 때만 표시
}

/**
 * 권한 게이트 컴포넌트
 */
export function PermissionGate({ children, inverse = false, ...props }: PermissionGateProps) {
  return (
    <ProtectedComponent {...props} showMessage={false}>
      {inverse ? null : children}
    </ProtectedComponent>
  )
}

/**
 * 권한이 없을 때만 표시되는 컴포넌트
 */
export function RestrictedComponent({ children, ...props }: Omit<ProtectedComponentProps, 'children'> & { children: ReactNode }) {
  return (
    <ProtectedComponent {...props} showMessage={false} fallback={children} />
  )
}

/**
 * 역할별 컴포넌트 렌더링
 */
export function RoleBasedComponent({
  master,
  admin,
  general,
  fallback
}: {
  master?: ReactNode
  admin?: ReactNode
  general?: ReactNode
  fallback?: ReactNode
}) {
  const { hasRole } = useAuthorization()

  if (hasRole('master') && master) {
    return <>{master}</>
  }

  if (hasRole('admin') && admin) {
    return <>{admin}</>
  }

  if (hasRole('general') && general) {
    return <>{general}</>
  }

  return fallback ? <>{fallback}</> : null
}

/**
 * 승인 상태별 컴포넌트 렌더링
 */
export function ApprovalBasedComponent({
  approved,
  pending,
  fallback
}: {
  approved?: ReactNode
  pending?: ReactNode
  fallback?: ReactNode
}) {
  const { isApproved } = useAuthorization()

  if (isApproved() && approved) {
    return <>{approved}</>
  }

  if (!isApproved() && pending) {
    return <>{pending}</>
  }

  return fallback ? <>{fallback}</> : null
}
