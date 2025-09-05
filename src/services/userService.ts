import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types/database'

export const userService = {
  // 모든 사용자 조회 (승인 대기중인 사용자를 상단에 정렬)
  async getUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('status', { ascending: false }) // 승인 대기중인 사용자를 상단에
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // 사용자 ID로 조회
  async getUser(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // 사용자 역할 수정
  async updateUserRole(id: string, role: 'master' | 'admin' | 'general') {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 사용자 이름 수정
  async updateUserName(id: string, name: string) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ name })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 사용자 상태 수정 (승인/거부)
  async updateUserStatus(id: string, status: 'pending' | 'approved' | 'rejected') {
    const { data, error } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 사용자 삭제
  async deleteUser(id: string) {
    // 먼저 profiles에서 삭제
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)

    if (profileError) throw profileError

    // auth.users에서도 삭제 (Supabase에서는 관리자 권한 필요)
    const { error: authError } = await supabase.auth.admin.deleteUser(id)

    if (authError) {
      console.error('Auth user deletion failed:', authError)
      // 프로필은 삭제되었으므로 여기서는 에러를 throw하지 않음
    }
  },

  // 사용자 검색
  async searchUsers(query: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .order('status', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }
}
