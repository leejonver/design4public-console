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
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)

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

    // 초기 세션 확인을 위한 이벤트 트리거
    const initializeAuth = async () => {
      try {
        console.log('Initializing: Getting initial session...')
        // 이 호출이 INITIAL_SESSION 이벤트를 트리거하지만, 우리는 그걸 무시할 것임
        await supabase.auth.getSession()
      } catch (error) {
        console.error('Failed to trigger initial session:', error)
        if (mounted) {
          setIsInitialized(true)
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

      // INITIAL_SESSION 이벤트 처리
      if (event === 'INITIAL_SESSION') {
        console.log('Auth state change: Handling INITIAL_SESSION event')
        setSession(session)

        if (session?.user && !isInitialized) {
          console.log('Auth state change: Loading user from INITIAL_SESSION')
          // 임시 사용자 설정
          const tempUser = {
            id: session.user.id,
            email: session.user.email || '',
            profile: undefined
          }
          setUser(tempUser)

          // 프로필 로딩 시작
          if (!isLoadingProfile) {
            setIsLoadingProfile(true)
            setTimeout(async () => {
              if (!mounted) return
              try {
                console.log('Background: Loading profile from INITIAL_SESSION...')
                const currentUser = await getCurrentUser()
                if (currentUser && mounted) {
                  setUser(currentUser)
                  setIsInitialized(true)
                  console.log('Background: Profile loading completed from INITIAL_SESSION')
                }
              } catch (error) {
                console.error('Background: Failed to load profile from INITIAL_SESSION:', error)
                if (mounted) {
                  setIsInitialized(true)
                }
              } finally {
                if (mounted) {
                  setIsLoadingProfile(false)
                  setLoading(false)
                }
              }
            }, 100)
          }
        } else if (!session?.user) {
          setIsInitialized(true)
          setLoading(false)
        }
        return
      }

      // 초기화가 완료되었고 세션이 동일하면 무시 (더 엄격한 조건)
      if (isInitialized && session?.user?.id === user?.id && !isLoadingProfile) {
        console.log('Auth state change: Ignoring duplicate event')
        return
      }

      setSession(session)

      if (session?.user) {
        try {
          console.log('Auth state change: User found, getting current user...')

          // 임시: Supabase 세션 정보만으로 사용자 객체 생성
          const tempUser = {
            id: session.user.id,
            email: session.user.email || '',
            profile: undefined // 프로필은 나중에 로드
          }

          console.log('Auth state change: Setting temp user:', tempUser)
          setUser(tempUser)

          // 프로필 로딩이 진행 중이 아니고 초기화되지 않은 경우에만 백그라운드 로딩
          if (!isInitialized && !isLoadingProfile) {
            setIsLoadingProfile(true)

            setTimeout(async () => {
              if (!mounted) return

              try {
                console.log('Background: Loading profile...')
                const currentUser = await getCurrentUser()
                console.log('Background: Current user loaded:', { user: !!currentUser, profile: !!currentUser?.profile })

                if (currentUser && mounted) {
                  setUser(currentUser)
                  setIsInitialized(true)
                  console.log('Background: Profile loading completed')
                } else if (mounted) {
                  setIsInitialized(true)
                }
              } catch (profileError) {
                console.error('Background: Failed to load profile, keeping temp user:', profileError)
                if (mounted) {
                  setIsInitialized(true)
                }
              } finally {
                if (mounted) {
                  setIsLoadingProfile(false)
                }
              }
            }, 100)
          }
        } catch (error) {
          console.error('Failed to get current user in auth state change:', error)
          setUser(null)
          if (mounted) {
            setIsInitialized(true)
            setIsLoadingProfile(false)
          }
        }
      } else {
        console.log('Auth state change: No user session')
        setUser(null)
        if (mounted) {
          setIsInitialized(true)
          setIsLoadingProfile(false)
        }
      }

      // 로딩 상태는 초기화 시에만 false로 설정
      if (!isInitialized) {
        console.log('Setting loading to false (auth state change)')
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [isInitialized]) // isInitialized가 변경될 때만 재실행

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
