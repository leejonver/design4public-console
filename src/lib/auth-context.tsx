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

    const initializeAuth = async () => {
      // 이미 초기화되었으면 실행하지 않음
      if (isInitialized) {
        console.log('Auth already initialized, skipping')
        return
      }

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
            // 초기 세션에서 사용자 로딩
            try {
              console.log('Initializing: Loading user from session')
              const currentUser = await getCurrentUser()
              setUser(currentUser)
              setIsInitialized(true)
              console.log('Initializing: Complete')
            } catch (error) {
              console.error('Failed to get current user during init:', error)
              setUser(null)
              setIsInitialized(true)
            }
          } else {
            setIsInitialized(true)
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error)
        if (mounted) {
          setIsInitialized(true)
        }
      } finally {
        if (mounted && !isInitialized) {
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
