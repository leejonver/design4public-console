import { supabase } from '@/lib/supabase'
import type { Brand, BrandInsert, BrandUpdate } from '@/types/database'

export const brandService = {
  // 모든 브랜드 조회
  async getBrands() {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    return data
  },

  // 브랜드 ID로 조회
  async getBrand(id: string) {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // 브랜드 생성
  async createBrand(brand: BrandInsert) {
    const { data, error } = await supabase
      .from('brands')
      .insert(brand)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 브랜드 수정
  async updateBrand(id: string, brand: BrandUpdate) {
    const { data, error } = await supabase
      .from('brands')
      .update(brand)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 브랜드 삭제
  async deleteBrand(id: string) {
    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // 브랜드 검색
  async searchBrands(query: string) {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('name', { ascending: true })

    if (error) throw error
    return data
  },

  // 브랜드명 중복 체크
  async checkBrandExists(name: string, excludeId?: string) {
    let query = supabase
      .from('brands')
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
