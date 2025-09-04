import { supabase } from '@/lib/supabase'
import type { Item, ItemInsert, ItemUpdate } from '@/types/database-generated'

export const getItems = async () => {
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
}

export const getItemById = async (id: string) => {
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
}

export const createItem = async (item: ItemInsert) => {
  const { data, error } = await supabase
    .from('items')
    .insert(item)
    .select(`
      *,
      brands (
        id,
        name
      )
    `)
    .single()

  if (error) throw error
  return data
}

export const updateItem = async (id: string, updates: ItemUpdate) => {
  const { data, error } = await supabase
    .from('items')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      brands (
        id,
        name
      )
    `)
    .single()

  if (error) throw error
  return data
}

export const deleteItem = async (id: string) => {
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export const getItemsByBrand = async (brandId: string) => {
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
}
