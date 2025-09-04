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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

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

  // 로그아웃
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
    } catch (error) {
      console.error('Failed to sign out:', error)
    }
  }

  // 초기 로드 및 세션 변경 감지
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        // 현재 세션 가져오기
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Failed to get session:', error)
          return
        }

        if (mounted) {
          setSession(session)

          if (session?.user) {
            try {
              const currentUser = await getCurrentUser()
              setUser(currentUser)
            } catch (error) {
              console.error('Failed to get current user:', error)
              setUser(null)
            }
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error)
      } finally {
        if (mounted) {
          console.log('Setting loading to false (initialize auth)')
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // 세션 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log('Auth state changed:', event, session?.user?.email)

      setSession(session)

      if (session?.user) {
        try {
          console.log('Auth state change: User found, getting current user...')
          const currentUser = await getCurrentUser()
          console.log('Auth state change: Current user loaded:', { user: !!currentUser, profile: !!currentUser?.profile })
          setUser(currentUser)
        } catch (error) {
          console.error('Failed to get current user in auth state change:', error)
          setUser(null)
        }
      } else {
        console.log('Auth state change: No user session')
        setUser(null)
      }

      console.log('Setting loading to false (auth state change)')
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value: AuthContextType = {
    user,
    session,
    loading,
    signOut,
    refreshUser,
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
