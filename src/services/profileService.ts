import { supabase } from '@/lib/supabase'
import { Profile, ProfileInsert, ProfileUpdate } from '@/types/database'

/**
 * 사용자 프로필 관련 서비스 함수들
 */

/**
 * 현재 로그인된 사용자의 프로필 정보를 가져옵니다.
 */
export const getCurrentUserProfile = async (): Promise<Profile | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return null
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('프로필 조회 오류:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('현재 사용자 프로필 조회 중 오류:', error)
    return null
  }
}

/**
 * 특정 사용자의 프로필 정보를 가져옵니다.
 */
export const getUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('프로필 조회 오류:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('사용자 프로필 조회 중 오류:', error)
    return null
  }
}

/**
 * 모든 사용자 프로필을 가져옵니다 (관리자용).
 */
export const getAllUserProfiles = async (): Promise<Profile[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('모든 프로필 조회 오류:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('모든 사용자 프로필 조회 중 오류:', error)
    throw error
  }
}

/**
 * 사용자 프로필을 업데이트합니다.
 */
export const updateUserProfile = async (
  userId: string,
  updates: ProfileUpdate
): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('프로필 업데이트 오류:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('사용자 프로필 업데이트 중 오류:', error)
    throw error
  }
}

/**
 * 현재 로그인된 사용자의 프로필을 업데이트합니다.
 */
export const updateCurrentUserProfile = async (
  updates: ProfileUpdate
): Promise<Profile | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('로그인된 사용자가 없습니다')
    }

    return await updateUserProfile(user.id, updates)
  } catch (error) {
    console.error('현재 사용자 프로필 업데이트 중 오류:', error)
    throw error
  }
}

/**
 * 사용자 상태를 업데이트합니다 (관리자용).
 */
export const updateUserStatus = async (
  userId: string,
  status: 'pending' | 'approved' | 'rejected'
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', userId)

    if (error) {
      console.error('사용자 상태 업데이트 오류:', error)
      throw error
    }

    return true
  } catch (error) {
    console.error('사용자 상태 업데이트 중 오류:', error)
    throw error
  }
}

/**
 * 사용자 역할을 업데이트합니다 (관리자용).
 */
export const updateUserRole = async (
  userId: string,
  role: 'master' | 'admin' | 'general'
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)

    if (error) {
      console.error('사용자 역할 업데이트 오류:', error)
      throw error
    }

    return true
  } catch (error) {
    console.error('사용자 역할 업데이트 중 오류:', error)
    throw error
  }
}

/**
 * 사용자를 삭제합니다 (관리자용).
 */
export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    // 먼저 auth.users에서 사용자 삭제 (프로필은 cascade로 삭제됨)
    const { error } = await supabase.auth.admin.deleteUser(userId)

    if (error) {
      console.error('사용자 삭제 오류:', error)
      throw error
    }

    return true
  } catch (error) {
    console.error('사용자 삭제 중 오류:', error)
    throw error
  }
}

/**
 * 이메일로 사용자 검색 (관리자용).
 */
export const searchUsersByEmail = async (email: string): Promise<Profile[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('email', `%${email}%`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('사용자 이메일 검색 오류:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('사용자 이메일 검색 중 오류:', error)
    throw error
  }
}

/**
 * 역할별 사용자 수를 가져옵니다 (관리자용).
 */
export const getUserStats = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role, status')

    if (error) {
      console.error('사용자 통계 조회 오류:', error)
      throw error
    }

    const stats = {
      total: data?.length || 0,
      byRole: {
        master: data?.filter(p => p.role === 'master').length || 0,
        admin: data?.filter(p => p.role === 'admin').length || 0,
        general: data?.filter(p => p.role === 'general').length || 0,
      },
      byStatus: {
        pending: data?.filter(p => p.status === 'pending').length || 0,
        approved: data?.filter(p => p.status === 'approved').length || 0,
        rejected: data?.filter(p => p.status === 'rejected').length || 0,
      }
    }

    return stats
  } catch (error) {
    console.error('사용자 통계 조회 중 오류:', error)
    throw error
  }
}

/**
 * 프로필 완성도를 계산합니다.
 */
export const calculateProfileCompletion = (profile: Profile): number => {
  let completed = 0
  let total = 3 // 이메일, 역할, 상태

  // 이메일 확인
  if (profile.email) completed++

  // 역할 확인
  if (profile.role) completed++

  // 상태 확인
  if (profile.status) completed++

  return Math.round((completed / total) * 100)
}
