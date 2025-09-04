'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Eye, Calendar, MapPin, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { getProjectWithDetails, deleteProject, addProjectItem, removeProjectItem, addProjectTag, removeProjectTag } from '@/services/projectService'
import ItemSelector from '@/components/features/ItemSelector'
import TagSelector from '@/components/features/TagSelector'
import ImageTagManager from '@/components/features/ImageTagManager'

export default function ProjectDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const projectId = params.id as string

  useEffect(() => {
    loadProject()
  }, [projectId])

  const loadProject = async () => {
    try {
      setLoading(true)
      const data = await getProjectWithDetails(projectId)
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
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setDeleteLoading(true)
      await deleteProject(projectId)

      toast({
        title: '프로젝트 삭제 완료',
        description: '프로젝트가 성공적으로 삭제되었습니다.',
      })

      router.push('/projects')
    } catch (error: any) {
      console.error('Failed to delete project:', error)
      toast({
        title: '프로젝트 삭제 실패',
        description: error.message || '프로젝트 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleItemAdd = async (itemId: string) => {
    try {
      await addProjectItem(projectId, itemId)
      // 프로젝트 데이터 새로고침
      const updatedProject = await getProjectWithDetails(projectId)
      setProject(updatedProject)
    } catch (error: any) {
      console.error('Failed to add item to project:', error)
      throw error
    }
  }

  const handleItemRemove = async (itemId: string) => {
    try {
      await removeProjectItem(projectId, itemId)
      // 프로젝트 데이터 새로고침
      const updatedProject = await getProjectWithDetails(projectId)
      setProject(updatedProject)
    } catch (error: any) {
      console.error('Failed to remove item from project:', error)
      throw error
    }
  }

  const handleTagAdd = async (tagId: string) => {
    try {
      await addProjectTag(projectId, tagId)
      // 프로젝트 데이터 새로고침
      const updatedProject = await getProjectWithDetails(projectId)
      setProject(updatedProject)
    } catch (error: any) {
      console.error('Failed to add tag to project:', error)
      throw error
    }
  }

  const handleTagRemove = async (tagId: string) => {
    try {
      await removeProjectTag(projectId, tagId)
      // 프로젝트 데이터 새로고침
      const updatedProject = await getProjectWithDetails(projectId)
      setProject(updatedProject)
    } catch (error: any) {
      console.error('Failed to remove tag from project:', error)
      throw error
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">게시됨</Badge>
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">임시저장</Badge>
      case 'hidden':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">숨김</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            뒤로가기
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <p className="text-muted-foreground">
              프로젝트 상세 정보
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/projects/${projectId}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            수정
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4 mr-2" />
                삭제
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
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleteLoading ? '삭제 중...' : '삭제'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* 기본 정보 */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    프로젝트 정보
                  </CardTitle>
                  <CardDescription>
                    프로젝트의 기본 정보입니다.
                  </CardDescription>
                </div>
                {getStatusBadge(project.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.description && (
                <div>
                  <h4 className="font-medium mb-2">설명</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {project.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {project.year && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      준공 연도: {project.year}년
                    </span>
                  </div>
                )}

                {project.area && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      면적: {project.area}㎡
                    </span>
                  </div>
                )}
              </div>

              <div className="text-xs text-muted-foreground">
                생성일: {new Date(project.created_at).toLocaleDateString('ko-KR')}
                {project.updated_at !== project.created_at && (
                  <span className="ml-4">
                    수정일: {new Date(project.updated_at).toLocaleDateString('ko-KR')}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 커버 이미지 */}
          {project.cover_image_url && (
            <Card>
              <CardHeader>
                <CardTitle>커버 이미지</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={project.cover_image_url}
                  alt={project.title}
                  className="w-full max-w-md h-48 object-cover rounded-lg border"
                />
              </CardContent>
            </Card>
          )}

          {/* 프로젝트 이미지들 */}
          {project.project_images && project.project_images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>프로젝트 이미지</CardTitle>
                <CardDescription>
                  프로젝트 갤러리 이미지들입니다. 각 이미지별로 태그를 관리할 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {project.project_images
                    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                    .map((image: any) => (
                      <ImageTagManager
                        key={image.id}
                        imageId={image.id}
                        imageUrl={image.image_url}
                        imageAlt={`프로젝트 이미지 ${image.order || 0}`}
                        onTagsChange={(tags) => {
                          // 태그 변경 시 프로젝트 데이터 새로고침 가능
                          console.log('Image tags changed:', image.id, tags)
                        }}
                      />
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 사이드바 정보 */}
        <div className="space-y-6">
          {/* 태그 관리 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                프로젝트 태그
              </CardTitle>
              <CardDescription>
                이 프로젝트를 분류하기 위한 태그들을 관리하세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TagSelector
                projectId={project.id}
                onTagAdd={handleTagAdd}
                onTagRemove={handleTagRemove}
                connectedTagIds={project.project_tags?.map((pt: any) => pt.tag_id) || []}
              />
            </CardContent>
          </Card>

          {/* 아이템 관리 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                사용된 가구 아이템
              </CardTitle>
              <CardDescription>
                이 프로젝트에 사용된 가구 아이템들을 관리하세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ItemSelector
                projectId={project.id}
                onItemAdd={handleItemAdd}
                onItemRemove={handleItemRemove}
                connectedItemIds={project.project_items?.map((pi: any) => pi.item_id) || []}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
