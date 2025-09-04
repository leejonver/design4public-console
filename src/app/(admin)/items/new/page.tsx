'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import ItemForm from '@/components/features/ItemForm'
import { createItem } from '@/services/itemService'
import type { ItemInsert } from '@/types/database-generated'

export default function NewItemPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: ItemInsert) => {
    try {
      setLoading(true)
      await createItem(data)

      toast({
        title: '아이템 생성 완료',
        description: '새 아이템이 성공적으로 생성되었습니다.',
      })

      router.push('/items')
    } catch (error: unknown) {
      console.error('Failed to create item:', error)
      toast({
        title: '아이템 생성 실패',
        description: error instanceof Error ? error.message : '아이템 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/items')
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
          <h1 className="text-3xl font-bold">새 아이템 추가</h1>
          <p className="text-muted-foreground">
            새로운 가구 아이템을 등록하세요.
          </p>
        </div>
      </div>

      {/* 아이템 폼 */}
      <div className="max-w-4xl">
        <ItemForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      </div>
    </div>
  )
}
