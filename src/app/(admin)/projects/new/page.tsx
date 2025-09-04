'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import ProjectForm from '@/components/features/ProjectForm'
import { createProject } from '@/services/projectService'
import type { ProjectInsert } from '@/types/database-generated'

export default function NewProjectPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: ProjectInsert) => {
    try {
      setLoading(true)
      await createProject(data)

      toast({
        title: '프로젝트 생성 완료',
        description: '새 프로젝트가 성공적으로 생성되었습니다.',
      })

      router.push('/projects')
    } catch (error: unknown) {
      console.error('Failed to create project:', error)
      toast({
        title: '프로젝트 생성 실패',
        description: error instanceof Error ? error.message : '프로젝트 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/projects')
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
          <h1 className="text-3xl font-bold">새 프로젝트 추가</h1>
          <p className="text-muted-foreground">
            새로운 공공 조달 가구 납품 사례 프로젝트를 등록하세요.
          </p>
        </div>
      </div>

      {/* 프로젝트 폼 */}
      <div className="max-w-4xl">
        <ProjectForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      </div>
    </div>
  )
}
