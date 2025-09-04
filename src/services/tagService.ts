import { supabase } from '@/lib/supabase'
import type { Tag, TagInsert, TagUpdate } from '@/types/database-generated'

export const getTags = async () => {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return data
}

export const getTagById = async (id: string) => {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export const createTag = async (tag: TagInsert) => {
  const { data, error } = await supabase
    .from('tags')
    .insert(tag)
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateTag = async (id: string, updates: TagUpdate) => {
  const { data, error } = await supabase
    .from('tags')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteTag = async (id: string) => {
  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// 태그 검색 (자동완성용)
export const searchTags = async (query: string, limit = 10) => {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .ilike('name', `%${query}%`)
    .limit(limit)
    .order('name', { ascending: true })

  if (error) throw error
  return data
}
