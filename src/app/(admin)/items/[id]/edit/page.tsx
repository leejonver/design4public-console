'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import ItemForm from '@/components/features/ItemForm'
import { getItemById, updateItem } from '@/services/itemService'
import type { Item, ItemUpdate } from '@/types/database-generated'

export default function EditItemPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)

  const itemId = params.id as string

  useEffect(() => {
    loadItem()
  }, [itemId])

  const loadItem = async () => {
    try {
      setFetchLoading(true)
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
      setFetchLoading(false)
    }
  }

  const handleSubmit = async (data: ItemUpdate) => {
    try {
      setLoading(true)
      await updateItem(itemId, data)

      toast({
        title: '아이템 수정 완료',
        description: '아이템이 성공적으로 수정되었습니다.',
      })

      router.push('/items')
    } catch (error: any) {
      console.error('Failed to update item:', error)
      toast({
        title: '아이템 수정 실패',
        description: error.message || '아이템 수정 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/items')
  }

  if (fetchLoading) {
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
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          뒤로가기
        </Button>
        <div>
          <h1 className="text-3xl font-bold">아이템 수정</h1>
          <p className="text-muted-foreground">
            "{item.name}" 아이템 정보를 수정하세요.
          </p>
        </div>
      </div>

      {/* 아이템 폼 */}
      <div className="max-w-4xl">
        <ItemForm
          item={item}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      </div>
    </div>
  )
}
