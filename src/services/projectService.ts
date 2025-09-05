import { supabase } from '@/lib/supabase'
import type { Project, ProjectInsert, ProjectUpdate } from '@/types/database'

export const projectService = {
  // 모든 프로젝트 조회
  async getProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // 프로젝트 ID로 조회
  async getProject(id: string) {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_images (*),
        project_items (
          item_id,
          items (*)
        ),
        project_tags (
          tag_id,
          tags (*)
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // 프로젝트 생성
  async createProject(project: ProjectInsert) {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 프로젝트 수정
  async updateProject(id: string, updates: ProjectUpdate) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 프로젝트 삭제
  async deleteProject(id: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // 프로젝트 검색
  async searchProjects(query: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // 상태별 프로젝트 조회
  async getProjectsByStatus(status: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // 이미지 파일을 Supabase Storage에 업로드
  async uploadImage(file: File, projectId: string): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `projects/${projectId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('project-images')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('project-images')
      .getPublicUrl(filePath)

    return data.publicUrl
  },

  // 프로젝트 이미지 추가
  async addProjectImage(projectId: string, imageUrl: string, order?: number) {
    const { data, error } = await supabase
      .from('project_images')
      .insert({
        project_id: projectId,
        image_url: imageUrl,
        order: order || 0
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 프로젝트 이미지 순서 업데이트
  async updateImageOrder(imageId: string, order: number) {
    const { data, error } = await supabase
      .from('project_images')
      .update({ order })
      .eq('id', imageId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 프로젝트 이미지 삭제
  async removeProjectImage(imageId: string) {
    const { error } = await supabase
      .from('project_images')
      .delete()
      .eq('id', imageId)

    if (error) throw error
  },

  // 프로젝트 아이템 연결
  async addProjectItem(projectId: string, itemId: string) {
    const { data, error } = await supabase
      .from('project_items')
      .insert({
        project_id: projectId,
        item_id: itemId
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 프로젝트 아이템 제거
  async removeProjectItem(projectId: string, itemId: string) {
    const { error } = await supabase
      .from('project_items')
      .delete()
      .eq('project_id', projectId)
      .eq('item_id', itemId)

    if (error) throw error
  },

  // 프로젝트 태그 연결
  async addProjectTag(projectId: string, tagId: string) {
    const { data, error } = await supabase
      .from('project_tags')
      .insert({
        project_id: projectId,
        tag_id: tagId
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 프로젝트 태그 제거
  async removeProjectTag(projectId: string, tagId: string) {
    const { error } = await supabase
      .from('project_tags')
      .delete()
      .eq('project_id', projectId)
      .eq('tag_id', tagId)

    if (error) throw error
  }
}
