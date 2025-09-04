import { supabase } from '@/lib/supabase'
import type { Brand, BrandInsert, BrandUpdate } from '@/types/database-generated'

export const getBrands = async () => {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return data
}

export const getBrandById = async (id: string) => {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export const createBrand = async (brand: BrandInsert) => {
  const { data, error } = await supabase
    .from('brands')
    .insert(brand)
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateBrand = async (id: string, updates: BrandUpdate) => {
  const { data, error } = await supabase
    .from('brands')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteBrand = async (id: string) => {
  const { error } = await supabase
    .from('brands')
    .delete()
    .eq('id', id)

  if (error) throw error
}
