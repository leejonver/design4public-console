'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import TagForm from '@/components/features/TagForm'
import { createTag } from '@/services/tagService'
import type { TagInsert } from '@/types/database-generated'

export default function NewTagPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: TagInsert) => {
    try {
      setLoading(true)
      await createTag(data)

      toast({
        title: '태그 생성 완료',
        description: '새 태그가 성공적으로 생성되었습니다.',
      })

      router.push('/tags')
    } catch (error: any) {
      console.error('Failed to create tag:', error)
      toast({
        title: '태그 생성 실패',
        description: error.message || '태그 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/tags')
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
          <h1 className="text-3xl font-bold">새 태그 추가</h1>
          <p className="text-muted-foreground">
            새로운 태그를 등록하세요.
          </p>
        </div>
      </div>

      {/* 태그 폼 */}
      <div className="max-w-2xl">
        <TagForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      </div>
    </div>
  )
}
