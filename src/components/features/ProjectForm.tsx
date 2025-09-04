'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUpload, MultiFileUpload } from '@/components/ui/file-upload'
import { Save, X, Image as ImageIcon, Upload, Images } from 'lucide-react'
import { uploadProjectCover, uploadProjectImage, uploadMultipleFiles } from '@/services/storageService'
import { addProjectImages, getProjectImages } from '@/services/projectService'
import type { Project, ProjectImage } from '@/types/database-generated'

const projectSchema = z.object({
  title: z.string().min(1, '프로젝트명을 입력해주세요'),
  description: z.string().optional(),
  cover_image_url: z.string().url().optional().or(z.literal('')),
  year: z.number().min(1900).max(new Date().getFullYear() + 10).optional(),
  area: z.number().min(0).optional(),
  status: z.enum(['draft', 'published', 'hidden']),
})

type ProjectFormData = z.infer<typeof projectSchema>

interface ProjectFormProps {
  project?: Project
  onSubmit: (data: ProjectFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export default function ProjectForm({ project, onSubmit, onCancel, loading = false }: ProjectFormProps) {
  const [uploading, setUploading] = useState(false)
  const [galleryImages, setGalleryImages] = useState<Array<{ url: string; file?: File }>>([])
  const [existingGalleryImages, setExistingGalleryImages] = useState<ProjectImage[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project?.title || '',
      description: project?.description || '',
      cover_image_url: project?.cover_image_url || '',
      year: project?.year || undefined,
      area: project?.area || undefined,
      status: (project?.status as 'draft' | 'published' | 'hidden') || 'draft',
    },
  })

  const watchedStatus = watch('status')
  const currentImageUrl = watch('cover_image_url')

  // 기존 갤러리 이미지 로드
  useEffect(() => {
    if (project?.id) {
      loadExistingGalleryImages()
    }
  }, [project?.id])

  const loadExistingGalleryImages = async () => {
    try {
      if (project?.id) {
        const images = await getProjectImages(project.id)
        setExistingGalleryImages(images)
      }
    } catch (error) {
      console.error('Failed to load gallery images:', error)
    }
  }

  const handleFormSubmit = async (data: ProjectFormData) => {
    await onSubmit(data)
  }

  const handleCoverFileSelect = async (file: File) => {
    try {
      setUploading(true)
      const result = await uploadProjectCover(file)
      setValue('cover_image_url', result.url)
    } catch (error) {
      console.error('File upload failed:', error)
      alert('파일 업로드에 실패했습니다.')
    } finally {
      setUploading(false)
    }
  }

  const handleCoverFileRemove = () => {
    setValue('cover_image_url', '')
  }

  const handleGalleryFilesSelect = async (files: File[]) => {
    try {
      setUploading(true)
      const uploadPromises = files.map(file => uploadProjectImage(file))
      const results = await Promise.all(uploadPromises)

      const newImages = results.map(result => ({
        url: result.url,
        file: undefined as File | undefined,
      }))

      setGalleryImages(prev => [...prev, ...newImages])
    } catch (error) {
      console.error('Gallery files upload failed:', error)
      alert('갤러리 이미지 업로드에 실패했습니다.')
    } finally {
      setUploading(false)
    }
  }

  const handleGalleryFileRemove = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* 기본 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
          <CardDescription>
            프로젝트의 기본 정보를 입력해주세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">프로젝트명 *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="예: 서울시청 민원실 리모델링"
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">프로젝트 설명</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="프로젝트에 대한 상세 설명을 입력해주세요."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">준공 연도</Label>
              <Input
                id="year"
                type="number"
                {...register('year', { valueAsNumber: true })}
                placeholder="예: 2024"
              />
              {errors.year && (
                <p className="text-sm text-red-600">{errors.year.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">면적 (㎡)</Label>
              <Input
                id="area"
                type="number"
                step="0.01"
                {...register('area', { valueAsNumber: true })}
                placeholder="예: 150.5"
              />
              {errors.area && (
                <p className="text-sm text-red-600">{errors.area.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">게시 상태</Label>
            <Select value={watchedStatus} onValueChange={(value) => setValue('status', value as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">임시저장</SelectItem>
                <SelectItem value="published">게시됨</SelectItem>
                <SelectItem value="hidden">숨김</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 커버 이미지 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            커버 이미지
          </CardTitle>
          <CardDescription>
            프로젝트의 대표 이미지를 설정하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 파일 업로드 */}
          <FileUpload
            onFileSelect={handleCoverFileSelect}
            onFileRemove={handleCoverFileRemove}
            currentImageUrl={currentImageUrl}
            placeholder="커버 이미지를 업로드하세요"
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

      {/* 갤러리 이미지 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Images className="h-5 w-5" />
            갤러리 이미지
          </CardTitle>
          <CardDescription>
            프로젝트의 상세 이미지를 업로드하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 기존 갤러리 이미지 표시 */}
          {existingGalleryImages.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">기존 이미지</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {existingGalleryImages.map((image, index) => (
                  <div key={image.id} className="relative">
                    <img
                      src={image.image_url}
                      alt={`갤러리 이미지 ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 새로 업로드할 이미지 */}
          {galleryImages.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">새로 추가할 이미지</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {galleryImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.url}
                      alt={`새 이미지 ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleGalleryFileRemove(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 다중 파일 업로드 */}
          <MultiFileUpload
            onFilesSelect={handleGalleryFilesSelect}
            onFileRemove={handleGalleryFileRemove}
            currentImages={galleryImages}
            placeholder="갤러리 이미지를 업로드하세요"
            disabled={uploading || loading}
            maxFiles={10}
          />

          {uploading && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              갤러리 이미지를 업로드하는 중...
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
