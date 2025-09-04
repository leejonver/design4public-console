'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, type User } from '@/services/authService'
import type { Session, AuthError } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  updateUserAfterSignIn: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  // 사용자 정보 새로고침
  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Failed to refresh user:', error)
      setUser(null)
    }
  }

  // 로그인 후 사용자 정보 수동 업데이트
  const updateUserAfterSignIn = async () => {
    try {
      console.log('Updating user after sign in...')
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Failed to get session after sign in:', error)
        return
      }

      if (session?.user) {
        setSession(session)

        // 임시 사용자 설정
        const tempUser = {
          id: session.user.id,
          email: session.user.email || '',
          profile: undefined
        }
        setUser(tempUser)

        // 프로필 로딩
        try {
          const currentUser = await getCurrentUser()
          if (currentUser) {
            setUser(currentUser)
            console.log('User updated after sign in successfully')
          }
        } catch (error) {
          console.error('Failed to load profile after sign in:', error)
        }
      }
    } catch (error) {
      console.error('Failed to update user after sign in:', error)
    }
  }

  // 로그아웃
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      setIsInitialized(true) // 로그아웃 후에도 초기화 상태 유지
      console.log('User signed out successfully')
    } catch (error) {
      console.error('Failed to sign out:', error)
    }
  }

  // 초기 로드 - 수동 세션 관리 (이벤트 기반이 아닌 직접 관리)
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      if (!mounted) return

      try {
        console.log('Initializing: Getting session manually...')

        // 수동으로 세션 확인
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Failed to get session:', error)
          if (mounted) {
            setIsInitialized(true)
            setLoading(false)
          }
          return
        }

        if (mounted) {
          setSession(session)

          if (session?.user) {
            console.log('Initializing: Loading user from session...')

            // 프로필 로딩 먼저 실행
            try {
              const currentUser = await getCurrentUser()
              if (currentUser && mounted) {
                setUser(currentUser)
                setIsInitialized(true)
                setLoading(false)
                console.log('Initializing: Profile loaded successfully')
                return
              }
            } catch (error) {
              console.error('Failed to load profile:', error)
              // 프로필 로드 실패 시 임시 사용자 설정
            }

            // 프로필 로드 실패 시에만 임시 사용자 설정
            if (mounted) {
              const tempUser = {
                id: session.user.id,
                email: session.user.email || '',
                profile: undefined
              }
              setUser(tempUser)
              setIsInitialized(true)
              setLoading(false)
              console.log('Initializing: Temp user set (profile load failed)')
            }
          } else {
            setIsInitialized(true)
            setLoading(false)
            console.log('Initializing: No user session')
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error)
        if (mounted) {
          setIsInitialized(true)
          setLoading(false)
        }
      }
    }

    initializeAuth()
  }, []) // 한 번만 실행

  const value: AuthContextType = {
    user,
    session,
    loading,
    signOut,
    refreshUser,
    updateUserAfterSignIn,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// 커스텀 훅
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// 역할 기반 접근 제어 훅
export function useAuthGuard(requiredRole?: 'master' | 'admin' | 'general') {
  const { user, loading } = useAuth()

  const hasAccess = () => {
    if (!user || !user.profile) return false

    if (!requiredRole) return user.profile.status === 'approved'

    const roleHierarchy = { master: 3, admin: 2, general: 1 }
    const userRoleLevel = roleHierarchy[user.profile.role as keyof typeof roleHierarchy] || 0
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0

    return user.profile.status === 'approved' && userRoleLevel >= requiredRoleLevel
  }

  return {
    user,
    loading,
    hasAccess: hasAccess(),
    isMaster: user?.profile?.role === 'master',
    isAdmin: user?.profile?.role === 'admin',
    isGeneral: user?.profile?.role === 'general',
    isApproved: user?.profile?.status === 'approved',
  }
}
