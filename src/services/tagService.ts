import { supabase } from '@/lib/supabase'
import type { Tag, TagInsert, TagUpdate } from '@/types/database'

export const tagService = {
  // 모든 태그 조회
  async getTags() {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    return data
  },

  // 태그 ID로 조회
  async getTag(id: string) {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // 태그 생성
  async createTag(tag: TagInsert) {
    const { data, error } = await supabase
      .from('tags')
      .insert(tag)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 태그 수정
  async updateTag(id: string, updates: TagUpdate) {
    const { data, error } = await supabase
      .from('tags')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 태그 삭제
  async deleteTag(id: string) {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // 태그 검색
  async searchTags(query: string) {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('name', { ascending: true })

    if (error) throw error
    return data
  },

  // 태그 존재 여부 확인 (중복 체크용)
  async checkTagExists(name: string, excludeId?: string) {
    let query = supabase
      .from('tags')
      .select('id')
      .eq('name', name)

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data, error } = await query

    if (error) throw error
    return data.length > 0
  }
}
