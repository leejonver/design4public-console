import { supabase } from '@/lib/supabase'
import type { Project, ProjectInsert, ProjectUpdate, ProjectImage, ProjectImageInsert, ProjectTag, ProjectItem } from '@/types/database-generated'

export const getProjects = async () => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const getProjectById = async (id: string) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// 프로젝트 상세 정보 조회 (이미지, 태그, 아이템 포함)
export const getProjectWithDetails = async (id: string) => {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      project_images (*),
      project_tags (
        tag_id,
        tags (*)
      ),
      project_items (
        item_id,
        items (*)
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export const createProject = async (project: ProjectInsert) => {
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateProject = async (id: string, updates: ProjectUpdate) => {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteProject = async (id: string) => {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export const getProjectsByStatus = async (status: 'draft' | 'published' | 'hidden') => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// 프로젝트 이미지 관리
export const addProjectImage = async (image: ProjectImageInsert) => {
  const { data, error } = await supabase
    .from('project_images')
    .insert(image)
    .select()
    .single()

  if (error) throw error
  return data
}

export const addProjectImages = async (images: ProjectImageInsert[]) => {
  const { data, error } = await supabase
    .from('project_images')
    .insert(images)
    .select()

  if (error) throw error
  return data
}

export const deleteProjectImage = async (imageId: string) => {
  const { error } = await supabase
    .from('project_images')
    .delete()
    .eq('id', imageId)

  if (error) throw error
}

export const updateProjectImageOrder = async (imageId: string, order: number) => {
  const { data, error } = await supabase
    .from('project_images')
    .update({ order })
    .eq('id', imageId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const getProjectImages = async (projectId: string) => {
  const { data, error } = await supabase
    .from('project_images')
    .select(`
      *,
      image_tags (
        tag_id,
        tags (*)
      )
    `)
    .eq('project_id', projectId)
    .order('order', { ascending: true })

  if (error) throw error
  return data
}

// 이미지 태그 관리
export const addImageTag = async (imageId: string, tagId: string) => {
  const { data, error } = await supabase
    .from('image_tags')
    .insert({ image_id: imageId, tag_id: tagId })
    .select()
    .single()

  if (error) throw error
  return data
}

export const removeImageTag = async (imageId: string, tagId: string) => {
  const { error } = await supabase
    .from('image_tags')
    .delete()
    .eq('image_id', imageId)
    .eq('tag_id', tagId)

  if (error) throw error
}

export const getImageTags = async (imageId: string) => {
  const { data, error } = await supabase
    .from('image_tags')
    .select(`
      tag_id,
      tags (*)
    `)
    .eq('image_id', imageId)

  if (error) throw error
  return data
}

// 프로젝트 태그 관리
export const addProjectTag = async (projectId: string, tagId: string) => {
  const { data, error } = await supabase
    .from('project_tags')
    .insert({ project_id: projectId, tag_id: tagId })
    .select()
    .single()

  if (error) throw error
  return data
}

export const removeProjectTag = async (projectId: string, tagId: string) => {
  const { error } = await supabase
    .from('project_tags')
    .delete()
    .eq('project_id', projectId)
    .eq('tag_id', tagId)

  if (error) throw error
}

// 프로젝트 아이템 관리
export const addProjectItem = async (projectId: string, itemId: string) => {
  const { data, error } = await supabase
    .from('project_items')
    .insert({ project_id: projectId, item_id: itemId })
    .select()
    .single()

  if (error) throw error
  return data
}

export const removeProjectItem = async (projectId: string, itemId: string) => {
  const { error } = await supabase
    .from('project_items')
    .delete()
    .eq('project_id', projectId)
    .eq('item_id', itemId)

  if (error) throw error
}
