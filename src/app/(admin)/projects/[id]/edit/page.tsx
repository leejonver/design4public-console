'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import ProjectForm from '@/components/features/ProjectForm'
import { getProjectById, updateProject } from '@/services/projectService'
import type { Project, ProjectUpdate } from '@/types/database-generated'

export default function EditProjectPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)

  const projectId = params.id as string

  useEffect(() => {
    loadProject()
  }, [projectId])

  const loadProject = async () => {
    try {
      setFetchLoading(true)
      const data = await getProjectById(projectId)
      setProject(data)
    } catch (error: any) {
      console.error('Failed to load project:', error)
      toast({
        title: '프로젝트 로드 실패',
        description: error.message || '프로젝트를 불러오는데 실패했습니다.',
        variant: 'destructive',
      })
      router.push('/projects')
    } finally {
      setFetchLoading(false)
    }
  }

  const handleSubmit = async (data: ProjectUpdate) => {
    try {
      setLoading(true)
      await updateProject(projectId, data)

      toast({
        title: '프로젝트 수정 완료',
        description: '프로젝트가 성공적으로 수정되었습니다.',
      })

      router.push('/projects')
    } catch (error: any) {
      console.error('Failed to update project:', error)
      toast({
        title: '프로젝트 수정 실패',
        description: error.message || '프로젝트 수정 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/projects')
  }

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>프로젝트를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-muted-foreground">프로젝트를 찾을 수 없습니다.</p>
          <Button onClick={() => router.push('/projects')} className="mt-4">
            프로젝트 목록으로 돌아가기
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          뒤로가기
        </Button>
        <div>
          <h1 className="text-3xl font-bold">프로젝트 수정</h1>
          <p className="text-muted-foreground">
            "{project.title}" 프로젝트 정보를 수정하세요.
          </p>
        </div>
      </div>

      {/* 프로젝트 폼 */}
      <div className="max-w-4xl">
        <ProjectForm
          project={project}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      </div>
    </div>
  )
}
