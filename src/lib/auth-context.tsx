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
  const [authEvent, setAuthEvent] = useState<{ event: string; session: Session | null } | null>(null)

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

    // 세션 변경 감지 - 이벤트만 저장하고 실제 처리는 별도 useEffect에서
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log('Auth state changed:', event, session?.user?.email)

      // 이벤트 정보를 저장하고 실제 처리는 별도 useEffect에서 수행
      setAuthEvent({ event, session })
    })

    // 이벤트 처리 useEffect - 이벤트가 발생할 때마다 실행
    useEffect(() => {
      if (!authEvent || !mounted) return

      const { event, session: newSession } = authEvent
      console.log('Processing auth event:', event)

      // INITIAL_SESSION 이벤트 처리
      if (event === 'INITIAL_SESSION') {
        console.log('Processing: Handling INITIAL_SESSION event')
        setSession(newSession)

        if (newSession?.user && !isInitialized) {
          console.log('Processing: Loading user from INITIAL_SESSION')
          // 임시 사용자 설정
          const tempUser = {
            id: newSession.user.id,
            email: newSession.user.email || '',
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
        } else if (!newSession?.user) {
          setIsInitialized(true)
          setLoading(false)
        }
        return
      }

      // SIGNED_IN 이벤트 처리
      if (event === 'SIGNED_IN' && newSession?.user) {
        console.log('Processing: Handling SIGNED_IN event')

        // 세션이 변경되었거나 초기화되지 않은 경우에만 처리
        if (!isInitialized || newSession.user.id !== user?.id) {
          // 임시 사용자 설정
          const tempUser = {
            id: newSession.user.id,
            email: newSession.user.email || '',
            profile: undefined
          }
          setUser(tempUser)
          setSession(newSession)

          // 프로필 로딩 시작
          if (!isLoadingProfile) {
            setIsLoadingProfile(true)
            setTimeout(async () => {
              if (!mounted) return
              try {
                console.log('Background: Loading profile from SIGNED_IN...')
                const currentUser = await getCurrentUser()
                if (currentUser && mounted) {
                  setUser(currentUser)
                  setIsInitialized(true)
                  console.log('Background: Profile loading completed from SIGNED_IN')
                }
              } catch (error) {
                console.error('Background: Failed to load profile from SIGNED_IN:', error)
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
        }
        return
      }

      // SIGNED_OUT 이벤트 처리
      if (event === 'SIGNED_OUT') {
        console.log('Processing: Handling SIGNED_OUT event')
        setUser(null)
        setSession(null)
        setIsInitialized(true)
        setLoading(false)
        setIsLoadingProfile(false)
        return
      }

    }, [authEvent, isInitialized, isLoadingProfile, user?.id])

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, []) // 초기화 시에만 실행

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
