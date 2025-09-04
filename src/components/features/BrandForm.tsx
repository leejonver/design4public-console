'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUpload } from '@/components/ui/file-upload'
import { Save, X, Tag, Upload, ExternalLink } from 'lucide-react'
import { uploadBrandCover } from '@/services/storageService'
import type { Brand } from '@/types/database-generated'

const brandSchema = z.object({
  name: z.string().min(1, '브랜드명을 입력해주세요'),
  description: z.string().optional(),
  cover_image_url: z.string().url().optional().or(z.literal('')),
  website_url: z.string().url().optional().or(z.literal('')),
})

type BrandFormData = z.infer<typeof brandSchema>

interface BrandFormProps {
  brand?: Brand
  onSubmit: (data: BrandFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export default function BrandForm({ brand, onSubmit, onCancel, loading = false }: BrandFormProps) {
  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: brand?.name || '',
      description: brand?.description || '',
      cover_image_url: brand?.cover_image_url || '',
      website_url: brand?.website_url || '',
    },
  })

  const watchedName = watch('name')
  const currentImageUrl = watch('cover_image_url')

  const handleFormSubmit = async (data: BrandFormData) => {
    await onSubmit(data)
  }

  const handleFileSelect = async (file: File) => {
    try {
      setUploading(true)
      const result = await uploadBrandCover(file)
      setValue('cover_image_url', result.url)
    } catch (error) {
      console.error('File upload failed:', error)
      alert('파일 업로드에 실패했습니다.')
    } finally {
      setUploading(false)
    }
  }

  const handleFileRemove = () => {
    setValue('cover_image_url', '')
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* 기본 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            기본 정보
          </CardTitle>
          <CardDescription>
            브랜드의 기본 정보를 입력해주세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">브랜드명 *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="예: 한샘, 이케아, 시디즈 등"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">브랜드 설명</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="브랜드에 대한 상세 설명을 입력해주세요."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* 웹사이트 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            웹사이트
          </CardTitle>
          <CardDescription>
            브랜드의 공식 웹사이트를 입력하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="website_url">웹사이트 URL</Label>
            <Input
              id="website_url"
              {...register('website_url')}
              placeholder="https://www.example.com"
            />
            {errors.website_url && (
              <p className="text-sm text-red-600">{errors.website_url.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 커버 이미지 */}
      <Card>
        <CardHeader>
          <CardTitle>커버 이미지</CardTitle>
          <CardDescription>
            브랜드의 대표 이미지를 설정하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 파일 업로드 */}
          <FileUpload
            onFileSelect={handleFileSelect}
            onFileRemove={handleFileRemove}
            currentImageUrl={currentImageUrl}
            placeholder="브랜드 커버 이미지를 업로드하세요"
            disabled={uploading || loading}
            className="w-full"
          />

          {/* 또는 URL 입력 */}
          <div className="space-y-2">
            <Label htmlFor="cover_image_url">또는 이미지 URL 입력</Label>
            <Input
              id="cover_image_url"
              {...register('cover_image_url')}
              placeholder="https://example.com/image.jpg"
            />
            {errors.cover_image_url && (
              <p className="text-sm text-red-600">{errors.cover_image_url.message}</p>
            )}
          </div>

          {uploading && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              이미지를 업로드하는 중...
            </div>
          )}
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
