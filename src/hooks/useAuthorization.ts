import { useAuth } from '@/contexts/AuthContext'

/**
 * 권한 관련 유틸리티 함수들
 */

export function useAuthorization() {
  const { user, profile } = useAuth()

  /**
   * 특정 권한이 있는지 확인
   */
  const hasPermission = (permission: string): boolean => {
    if (!user || !profile) return false

    switch (permission) {
      case 'read:projects':
        return ['master', 'admin', 'general'].includes(profile.role)

      case 'write:projects':
        return ['master', 'admin', 'general'].includes(profile.role)

      case 'delete:projects':
        return ['master', 'admin'].includes(profile.role)

      case 'read:items':
        return ['master', 'admin', 'general'].includes(profile.role)

      case 'write:items':
        return ['master', 'admin', 'general'].includes(profile.role)

      case 'delete:items':
        return ['master', 'admin'].includes(profile.role)

      case 'read:brands':
        return ['master', 'admin', 'general'].includes(profile.role)

      case 'write:brands':
        return ['master', 'admin'].includes(profile.role)

      case 'delete:brands':
        return ['master', 'admin'].includes(profile.role)

      case 'read:tags':
        return ['master', 'admin', 'general'].includes(profile.role)

      case 'write:tags':
        return ['master', 'admin'].includes(profile.role)

      case 'delete:tags':
        return ['master', 'admin'].includes(profile.role)

      case 'read:users':
        return profile.role === 'master'

      case 'write:users':
        return profile.role === 'master'

      case 'delete:users':
        return profile.role === 'master'

      case 'manage:roles':
        return profile.role === 'master'

      default:
        return false
    }
  }

  /**
   * 여러 권한 중 하나라도 있는지 확인
   */
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission))
  }

  /**
   * 모든 권한이 있는지 확인
   */
  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission))
  }

  /**
   * 특정 역할인지 확인
   */
  const hasRole = (role: 'master' | 'admin' | 'general'): boolean => {
    return profile?.role === role
  }

  /**
   * 특정 역할 이상인지 확인 (계층적 권한)
   */
  const hasRoleOrHigher = (role: 'master' | 'admin' | 'general'): boolean => {
    if (!profile) return false

    const roleHierarchy = {
      master: 3,
      admin: 2,
      general: 1
    }

    return roleHierarchy[profile.role] >= roleHierarchy[role]
  }

  /**
   * 승인된 사용자인지 확인
   */
  const isApproved = (): boolean => {
    return profile?.status === 'approved'
  }

  /**
   * 현재 사용자가 소유자인지 확인
   */
  const isOwner = (ownerId: string): boolean => {
    return user?.id === ownerId
  }

  /**
   * 수정 권한이 있는지 확인 (소유자이거나 관리자 권한)
   */
  const canEdit = (ownerId?: string): boolean => {
    if (!user || !profile) return false

    // 관리자 이상은 모든 항목 수정 가능
    if (hasRoleOrHigher('admin')) return true

    // 소유자인 경우 수정 가능
    if (ownerId && isOwner(ownerId)) return true

    return false
  }

  /**
   * 삭제 권한이 있는지 확인 (소유자이거나 관리자 권한)
   */
  const canDelete = (ownerId?: string): boolean => {
    if (!user || !profile) return false

    // 관리자 이상은 모든 항목 삭제 가능
    if (hasRoleOrHigher('admin')) return true

    // 소유자인 경우 삭제 가능
    if (ownerId && isOwner(ownerId)) return true

    return false
  }

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasRoleOrHigher,
    isApproved,
    isOwner,
    canEdit,
    canDelete,
    user,
    profile
  }
}
