'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Plus, Eye, Edit, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { getProjects, deleteProject } from '@/services/projectService'
import type { Project } from '@/types/database-generated'

export default function ProjectsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const data = await getProjects()
      setProjects(data)
    } catch (error: any) {
      console.error('Failed to load projects:', error)
      setError('프로젝트를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (projectId: string, projectTitle: string) => {
    try {
      setDeleteLoading(projectId)
      await deleteProject(projectId)

      toast({
        title: '프로젝트 삭제 완료',
        description: `"${projectTitle}" 프로젝트가 삭제되었습니다.`,
      })

      // 목록에서 제거
      setProjects(projects.filter(p => p.id !== projectId))
    } catch (error: any) {
      console.error('Failed to delete project:', error)
      toast({
        title: '프로젝트 삭제 실패',
        description: error.message || '프로젝트 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setDeleteLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">게시됨</span>
      case 'draft':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">임시저장</span>
      case 'hidden':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">숨김</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{status}</span>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>프로젝트를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">프로젝트 관리</h1>
          <p className="text-muted-foreground">
            공공 조달 가구 납품 사례 프로젝트를 관리하세요.
          </p>
        </div>

        <Button onClick={() => router.push('/projects/new')}>
          <Plus className="h-4 w-4 mr-2" />
          새 프로젝트 추가
        </Button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* 프로젝트 목록 */}
      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              등록된 프로젝트가 없습니다
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              첫 번째 프로젝트를 추가해보세요.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              새 프로젝트 추가
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg line-clamp-2 leading-tight">
                      {project.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mt-1 text-sm">
                      {project.description || '설명이 없습니다.'}
                    </CardDescription>
                  </div>
                  <div className="ml-2 flex-shrink-0">
                    {getStatusBadge(project.status)}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {project.year && (
                    <div>준공 연도: {project.year}년</div>
                  )}
                  {project.area && (
                    <div>면적: {project.area}㎡</div>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/projects/${project.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    보기
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/projects/${project.id}/edit`)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    수정
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        disabled={deleteLoading === project.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>프로젝트 삭제</AlertDialogTitle>
                        <AlertDialogDescription>
                          정말로 "{project.title}" 프로젝트를 삭제하시겠습니까?
                          이 작업은 되돌릴 수 없습니다.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(project.id, project.title)}
                          disabled={deleteLoading === project.id}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {deleteLoading === project.id ? '삭제 중...' : '삭제'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
