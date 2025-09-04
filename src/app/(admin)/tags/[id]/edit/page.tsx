'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import TagForm from '@/components/features/TagForm'
import { getTagById, updateTag } from '@/services/tagService'
import type { Tag, TagUpdate } from '@/types/database-generated'

export default function EditTagPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [tag, setTag] = useState<Tag | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)

  const tagId = params.id as string

  useEffect(() => {
    loadTag()
  }, [tagId])

  const loadTag = async () => {
    try {
      setFetchLoading(true)
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
      setFetchLoading(false)
    }
  }

  const handleSubmit = async (data: TagUpdate) => {
    try {
      setLoading(true)
      await updateTag(tagId, data)

      toast({
        title: '태그 수정 완료',
        description: '태그가 성공적으로 수정되었습니다.',
      })

      router.push('/tags')
    } catch (error: any) {
      console.error('Failed to update tag:', error)
      toast({
        title: '태그 수정 실패',
        description: error.message || '태그 수정 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/tags')
  }

  if (fetchLoading) {
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
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          뒤로가기
        </Button>
        <div>
          <h1 className="text-3xl font-bold">태그 수정</h1>
          <p className="text-muted-foreground">
            "{tag.name}" 태그 정보를 수정하세요.
          </p>
        </div>
      </div>

      {/* 태그 폼 */}
      <div className="max-w-2xl">
        <TagForm
          tag={tag}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      </div>
    </div>
  )
}
