'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Hash, Plus, Eye, Edit, Trash2 } from 'lucide-react'
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
import { getTags, deleteTag } from '@/services/tagService'
import type { Tag } from '@/types/database-generated'

export default function TagsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = async () => {
    try {
      setLoading(true)
      const data = await getTags()
      setTags(data)
    } catch (error: any) {
      console.error('Failed to load tags:', error)
      setError('태그를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (tagId: string, tagName: string) => {
    try {
      setDeleteLoading(tagId)
      await deleteTag(tagId)

      toast({
        title: '태그 삭제 완료',
        description: `"${tagName}" 태그가 삭제되었습니다.`,
      })

      // 목록에서 제거
      setTags(tags.filter(tag => tag.id !== tagId))
    } catch (error: any) {
      console.error('Failed to delete tag:', error)
      toast({
        title: '태그 삭제 실패',
        description: error.message || '태그 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setDeleteLoading(null)
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

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">태그 관리</h1>
          <p className="text-muted-foreground">
            프로젝트와 이미지를 분류하기 위한 태그를 관리하세요.
          </p>
        </div>

        <Button onClick={() => router.push('/tags/new')}>
          <Plus className="h-4 w-4 mr-2" />
          새 태그 추가
        </Button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* 태그 목록 */}
      {tags.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Hash className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              등록된 태그가 없습니다
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              첫 번째 태그를 추가해보세요.
            </p>
            <Button onClick={() => router.push('/tags/new')}>
              <Plus className="h-4 w-4 mr-2" />
              새 태그 추가
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tags.map((tag) => (
            <Card key={tag.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-lg">{tag.name}</CardTitle>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="text-xs text-muted-foreground mb-4">
                  생성일: {new Date(tag.created_at).toLocaleDateString('ko-KR')}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/tags/${tag.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    보기
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/tags/${tag.id}/edit`)}
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
                        disabled={deleteLoading === tag.id}
                      >
                        <Trash2 className="h-4 w-4" />
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
                          onClick={() => handleDelete(tag.id, tag.name)}
                          disabled={deleteLoading === tag.id}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {deleteLoading === tag.id ? '삭제 중...' : '삭제'}
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
