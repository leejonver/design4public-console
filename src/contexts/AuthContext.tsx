'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types/database'
import { getCurrentUserProfile } from '@/services/profileService'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // 사용자 프로필을 새로고침하는 함수
  const refreshProfile = async () => {
    try {
      if (user) {
        const userProfile = await getCurrentUserProfile()
        setProfile(userProfile)
      }
    } catch (error) {
      console.error('프로필 새로고침 중 오류:', error)
    }
  }

  // 로그아웃 함수
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('로그아웃 오류:', error)
        throw error
      }
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error('로그아웃 중 오류:', error)
      throw error
    }
  }

  // 인증 상태 변경 감지
  useEffect(() => {
    // 초기 인증 상태 확인
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          setUser(session.user)
          const userProfile = await getCurrentUserProfile()
          setProfile(userProfile)
        }
      } catch (error) {
        console.error('인증 초기화 중 오류:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('인증 상태 변경:', event, session?.user?.email)

        if (session?.user) {
          setUser(session.user)
          // 프로필 정보 가져오기
          try {
            const userProfile = await getCurrentUserProfile()
            setProfile(userProfile)
          } catch (error) {
            console.error('프로필 조회 중 오류:', error)
            setProfile(null)
          }
        } else {
          setUser(null)
          setProfile(null)
        }

        setLoading(false)
      }
    )

    // 클린업
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // 사용자 정보가 변경될 때 프로필 자동 새로고침
  useEffect(() => {
    if (user && !profile) {
      refreshProfile()
    }
  }, [user, profile])

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signOut,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// AuthContext를 사용하는 커스텀 훅
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// 사용자 역할 확인을 위한 유틸리티 함수들
export function useUserRole() {
  const { profile } = useAuth()
  return profile?.role || null
}

export function useUserStatus() {
  const { profile } = useAuth()
  return profile?.status || null
}

// 권한 확인을 위한 유틸리티 함수들
export function useIsMaster() {
  const role = useUserRole()
  return role === 'master'
}

export function useIsAdmin() {
  const role = useUserRole()
  return role === 'admin' || role === 'master'
}

export function useIsGeneral() {
  const role = useUserRole()
  return role === 'general'
}

export function useIsApproved() {
  const status = useUserStatus()
  return status === 'approved'
}
