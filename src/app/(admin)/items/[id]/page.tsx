'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Package, ExternalLink, Calendar } from 'lucide-react'
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
import { getItemById, deleteItem } from '@/services/itemService'

export default function ItemDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [item, setItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const itemId = params.id as string

  useEffect(() => {
    loadItem()
  }, [itemId])

  const loadItem = async () => {
    try {
      setLoading(true)
      const data = await getItemById(itemId)
      setItem(data)
    } catch (error: any) {
      console.error('Failed to load item:', error)
      toast({
        title: '아이템 로드 실패',
        description: error.message || '아이템을 불러오는데 실패했습니다.',
        variant: 'destructive',
      })
      router.push('/items')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setDeleteLoading(true)
      await deleteItem(itemId)

      toast({
        title: '아이템 삭제 완료',
        description: '아이템이 성공적으로 삭제되었습니다.',
      })

      router.push('/items')
    } catch (error: any) {
      console.error('Failed to delete item:', error)
      toast({
        title: '아이템 삭제 실패',
        description: error.message || '아이템 삭제 중 오류가 발생했습니다.',
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
          <p>아이템을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-muted-foreground">아이템을 찾을 수 없습니다.</p>
          <Button onClick={() => router.push('/items')} className="mt-4">
            아이템 목록으로 돌아가기
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
            <h1 className="text-3xl font-bold">{item.name}</h1>
            <p className="text-muted-foreground">
              아이템 상세 정보
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/items/${itemId}/edit`)}>
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
                <AlertDialogTitle>아이템 삭제</AlertDialogTitle>
                <AlertDialogDescription>
                  정말로 "{item.name}" 아이템을 삭제하시겠습니까?
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
                <Package className="h-5 w-5" />
                <CardTitle>아이템 정보</CardTitle>
              </div>
              <CardDescription>
                아이템의 기본 정보입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {item.description && (
                <div>
                  <h4 className="font-medium mb-2">설명</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {item.description}
                  </p>
                </div>
              )}

              {/* 브랜드 정보 */}
              {item.brands && (
                <div>
                  <h4 className="font-medium mb-2">브랜드</h4>
                  <Badge variant="secondary">
                    {item.brands.name}
                  </Badge>
                </div>
              )}

              {/* 나라장터 링크 */}
              {item.nara_url && (
                <div>
                  <h4 className="font-medium mb-2">나라장터</h4>
                  <a
                    href={item.nara_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-4 w-4" />
                    나라장터 링크 바로가기
                  </a>
                </div>
              )}

              <div className="text-xs text-muted-foreground pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>생성일: {new Date(item.created_at).toLocaleDateString('ko-KR')}</span>
                </div>
                {item.updated_at !== item.created_at && (
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-3 w-3" />
                    <span>수정일: {new Date(item.updated_at).toLocaleDateString('ko-KR')}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 사이드바 정보 */}
        <div className="space-y-6">
          {/* 아이템 이미지 */}
          {item.image_url && (
            <Card>
              <CardHeader>
                <CardTitle>아이템 이미지</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full max-w-sm h-48 object-cover rounded-lg border"
                />
              </CardContent>
            </Card>
          )}

          {/* 추가 정보 카드 */}
          <Card>
            <CardHeader>
              <CardTitle>관리 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="font-medium">아이템 ID:</span>
                <p className="text-muted-foreground font-mono text-xs mt-1">
                  {item.id}
                </p>
              </div>

              {item.brand_id && (
                <div>
                  <span className="font-medium">브랜드 ID:</span>
                  <p className="text-muted-foreground font-mono text-xs mt-1">
                    {item.brand_id}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
