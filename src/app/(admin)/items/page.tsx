'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Package, Plus, Eye, Edit, Trash2, ExternalLink } from 'lucide-react'
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
import { getItems, deleteItem } from '@/services/itemService'
import type { Item } from '@/types/database-generated'

export default function ItemsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    try {
      setLoading(true)
      const data = await getItems()
      setItems(data)
    } catch (error: any) {
      console.error('Failed to load items:', error)
      setError('아이템을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (itemId: string, itemName: string) => {
    try {
      setDeleteLoading(itemId)
      await deleteItem(itemId)

      toast({
        title: '아이템 삭제 완료',
        description: `"${itemName}" 아이템이 삭제되었습니다.`,
      })

      // 목록에서 제거
      setItems(items.filter(item => item.id !== itemId))
    } catch (error: any) {
      console.error('Failed to delete item:', error)
      toast({
        title: '아이템 삭제 실패',
        description: error.message || '아이템 삭제 중 오류가 발생했습니다.',
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
          <p>아이템을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">아이템 관리</h1>
          <p className="text-muted-foreground">
            공공 조달 가구 아이템을 관리하세요.
          </p>
        </div>

        <Button onClick={() => router.push('/items/new')}>
          <Plus className="h-4 w-4 mr-2" />
          새 아이템 추가
        </Button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* 아이템 목록 */}
      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              등록된 아이템이 없습니다
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              첫 번째 아이템을 추가해보세요.
            </p>
            <Button onClick={() => router.push('/items/new')}>
              <Plus className="h-4 w-4 mr-2" />
              새 아이템 추가
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">
                      {item.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {item.description || '설명이 없습니다.'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* 브랜드 정보 */}
                {item.brands && (
                  <div className="mb-3">
                    <Badge variant="secondary">
                      {item.brands.name}
                    </Badge>
                  </div>
                )}

                {/* 나라장터 링크 */}
                {item.nara_url && (
                  <div className="mb-3">
                    <a
                      href={item.nara_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="h-3 w-3" />
                      나라장터 링크
                    </a>
                  </div>
                )}

                {/* 아이템 이미지 */}
                {item.image_url && (
                  <div className="mb-4">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-32 object-cover rounded-lg border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}

                <div className="text-xs text-muted-foreground mb-4">
                  생성일: {new Date(item.created_at).toLocaleDateString('ko-KR')}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/items/${item.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    보기
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/items/${item.id}/edit`)}
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
                        disabled={deleteLoading === item.id}
                      >
                        <Trash2 className="h-4 w-4" />
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
                          onClick={() => handleDelete(item.id, item.name)}
                          disabled={deleteLoading === item.id}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {deleteLoading === item.id ? '삭제 중...' : '삭제'}
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
