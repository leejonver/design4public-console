'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Hash, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { getTagById, deleteTag } from '@/services/tagService'

export default function TagDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [tag, setTag] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const tagId = params.id as string

  useEffect(() => {
    loadTag()
  }, [tagId])

  const loadTag = async () => {
    try {
      setLoading(true)
      const data = await getTagById(tagId)
      setTag(data)
    } catch (error: any) {
      console.error('Failed to load tag:', error)
      toast({
        title: '태그 로드 실패',
        description: error.message || '태그를 불러오는데 실패했습니다.',
        variant: 'destructive',
      })
      router.push('/tags')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setDeleteLoading(true)
      await deleteTag(tagId)

      toast({
        title: '태그 삭제 완료',
        description: '태그가 성공적으로 삭제되었습니다.',
      })

      router.push('/tags')
    } catch (error: any) {
      console.error('Failed to delete tag:', error)
      toast({
        title: '태그 삭제 실패',
        description: error.message || '태그 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>태그를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!tag) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-muted-foreground">태그를 찾을 수 없습니다.</p>
          <Button onClick={() => router.push('/tags')} className="mt-4">
            태그 목록으로 돌아가기
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
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Hash className="h-6 w-6" />
              {tag.name}
            </h1>
            <p className="text-muted-foreground">
              태그 상세 정보
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/tags/${tagId}/edit`)}>
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
                <AlertDialogTitle>태그 삭제</AlertDialogTitle>
                <AlertDialogDescription>
                  정말로 "{tag.name}" 태그를 삭제하시겠습니까?
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
              <div className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                <CardTitle>태그 정보</CardTitle>
              </div>
              <CardDescription>
                태그의 기본 정보입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">태그명</h4>
                <p className="text-lg font-medium text-primary">{tag.name}</p>
              </div>

              <div className="text-xs text-muted-foreground pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>생성일: {new Date(tag.created_at).toLocaleDateString('ko-KR')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 사용 통계 (추후 구현) */}
          <Card>
            <CardHeader>
              <CardTitle>사용 통계</CardTitle>
              <CardDescription>
                이 태그가 사용된 프로젝트와 이미지의 수입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                사용 통계는 추후 구현 예정입니다.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 사이드바 정보 */}
        <div className="space-y-6">
          {/* 관리 정보 카드 */}
          <Card>
            <CardHeader>
              <CardTitle>관리 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="font-medium">태그 ID:</span>
                <p className="text-muted-foreground font-mono text-xs mt-1">
                  {tag.id}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 태그 미리보기 */}
          <Card>
            <CardHeader>
              <CardTitle>태그 미리보기</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {tag.name}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
