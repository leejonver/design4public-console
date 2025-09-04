import { supabase } from '@/lib/supabase'
import type { Profile, ProfileInsert, ProfileUpdate } from '@/types/database-generated'

export interface SignUpData {
  email: string
  password: string
}

export interface SignInData {
  email: string
  password: string
}

export interface User {
  id: string
  email: string
  profile?: Profile
}

// 회원가입
export const signUp = async (data: SignUpData) => {
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  })

  if (error) throw error

  return authData
}

// 로그인
export const signIn = async (data: SignInData) => {
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })

  if (error) throw error

  return authData
}

// 로그아웃
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// 현재 사용자 정보 가져오기
export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) return null

  // 프로필 정보도 함께 가져오기
  const profile = await getUserProfile(user.id)

  return {
    id: user.id,
    email: user.email || '',
    profile,
  }
}

// 사용자 프로필 가져오기
export const getUserProfile = async (userId: string): Promise<Profile | undefined> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) return undefined
  return data
}

// 사용자 프로필 업데이트
export const updateUserProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// 모든 사용자 목록 가져오기 (관리자용)
export const getAllUsers = async (): Promise<Profile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Profile[]
}

// 사용자 승인/거절 (마스터 권한 필요)
export const updateUserStatus = async (userId: string, status: 'approved' | 'rejected') => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ status })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// 사용자 역할 변경 (마스터 권한 필요)
export const updateUserRole = async (userId: string, role: 'master' | 'admin' | 'general') => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// 사용자 삭제 (마스터 권한 필요)
export const deleteUser = async (userId: string) => {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId)

  if (error) throw error
}

// 비밀번호 재설정 이메일 전송
export const sendPasswordResetEmail = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })

  if (error) throw error
}

// 비밀번호 업데이트
export const updatePassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) throw error
}

// 이메일 업데이트
export const updateEmail = async (newEmail: string) => {
  const { error } = await supabase.auth.updateUser({
    email: newEmail,
  })

  if (error) throw error
}
