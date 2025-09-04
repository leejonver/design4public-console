'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, X, Hash } from 'lucide-react'
import type { Tag } from '@/types/database-generated'

const tagSchema = z.object({
  name: z.string().min(1, '태그명을 입력해주세요').max(50, '태그명은 50자 이하로 입력해주세요'),
})

type TagFormData = z.infer<typeof tagSchema>

interface TagFormProps {
  tag?: Tag
  onSubmit: (data: TagFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export default function TagForm({ tag, onSubmit, onCancel, loading = false }: TagFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: tag?.name || '',
    },
  })

  const handleFormSubmit = async (data: TagFormData) => {
    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* 기본 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            태그 정보
          </CardTitle>
          <CardDescription>
            태그의 기본 정보를 입력해주세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">태그명 *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="예: 현대적, 심플, 사무용 등"
              maxLength={50}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              태그는 프로젝트나 이미지에 분류를 위해 사용됩니다.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 액션 버튼 */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          취소
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              저장 중...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              저장
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
