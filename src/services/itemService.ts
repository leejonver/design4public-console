import { supabase } from '@/lib/supabase'
import type { Item, ItemInsert, ItemUpdate, Brand } from '@/types/database'

export const itemService = {
  // 모든 아이템 조회
  async getItems() {
    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        brands (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // 아이템 ID로 조회
  async getItem(id: string) {
    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        brands (
          id,
          name
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // 아이템 생성
  async createItem(item: ItemInsert) {
    const { data, error } = await supabase
      .from('items')
      .insert(item)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 아이템 수정
  async updateItem(id: string, updates: ItemUpdate) {
    const { data, error } = await supabase
      .from('items')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 아이템 삭제
  async deleteItem(id: string) {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // 아이템 검색
  async searchItems(query: string) {
    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        brands (
          id,
          name
        )
      `)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // 브랜드별 아이템 조회
  async getItemsByBrand(brandId: string) {
    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        brands (
          id,
          name
        )
      `)
      .eq('brand_id', brandId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // 아이템 이미지 파일을 Supabase Storage에 업로드
  async uploadItemImage(file: File, itemId?: string): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = itemId
      ? `${itemId}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      : `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `items/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('item-images') // Supabase Storage bucket name
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('item-images')
      .getPublicUrl(filePath)

    return data.publicUrl
  }
}

// 브랜드 관련 서비스
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
  }
}
