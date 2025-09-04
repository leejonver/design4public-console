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
import { FileUpload } from '@/components/ui/file-upload'
import { Save, X, Package, Upload, ExternalLink } from 'lucide-react'
import { getBrands } from '@/services/brandService'
import { uploadItemImage } from '@/services/storageService'
import type { Item } from '@/types/database-generated'
import type { Brand } from '@/types/database-generated'

const itemSchema = z.object({
  name: z.string().min(1, '아이템명을 입력해주세요'),
  description: z.string().optional(),
  brand_id: z.string().nullable(),
  nara_url: z.string().url().optional().or(z.literal('')),
  image_url: z.string().url().optional().or(z.literal('')),
})

type ItemFormData = z.infer<typeof itemSchema>

interface ItemFormProps {
  item?: Item
  onSubmit: (data: ItemFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export default function ItemForm({ item, onSubmit, onCancel, loading = false }: ItemFormProps) {
  const [brands, setBrands] = useState<Brand[]>([])
  const [brandsLoading, setBrandsLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: item?.name || '',
      description: item?.description || '',
      brand_id: item?.brand_id || null,
      nara_url: item?.nara_url || '',
      image_url: item?.image_url || '',
    },
  })

  const watchedBrandId = watch('brand_id')
  const currentImageUrl = watch('image_url')

  useEffect(() => {
    loadBrands()
  }, [])

  const loadBrands = async () => {
    try {
      setBrandsLoading(true)
      const data = await getBrands()
      setBrands(data)
    } catch (error) {
      console.error('Failed to load brands:', error)
    } finally {
      setBrandsLoading(false)
    }
  }

  const handleFormSubmit = async (data: ItemFormData) => {
    await onSubmit(data)
  }

  const handleFileSelect = async (file: File) => {
    try {
      setUploading(true)
      const result = await uploadItemImage(file)
      setValue('image_url', result.url)
    } catch (error) {
      console.error('File upload failed:', error)
      alert('파일 업로드에 실패했습니다.')
    } finally {
      setUploading(false)
    }
  }

  const handleFileRemove = () => {
    setValue('image_url', '')
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* 기본 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            기본 정보
          </CardTitle>
          <CardDescription>
            아이템의 기본 정보를 입력해주세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">아이템명 *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="예: 책상, 의자, 캐비닛 등"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="아이템에 대한 상세 설명을 입력해주세요."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand_id">브랜드</Label>
            <Select
              value={watchedBrandId || ''}
              onValueChange={(value) => setValue('brand_id', value || null)}
              disabled={brandsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="브랜드를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">브랜드 없음</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 외부 링크 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            외부 링크
          </CardTitle>
          <CardDescription>
            관련된 외부 링크를 입력하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nara_url">나라장터 URL</Label>
            <Input
              id="nara_url"
              {...register('nara_url')}
              placeholder="https://www.g2b.go.kr/..."
            />
            {errors.nara_url && (
              <p className="text-sm text-red-600">{errors.nara_url.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 이미지 */}
      <Card>
        <CardHeader>
          <CardTitle>아이템 이미지</CardTitle>
          <CardDescription>
            아이템의 대표 이미지를 설정하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 파일 업로드 */}
          <FileUpload
            onFileSelect={handleFileSelect}
            onFileRemove={handleFileRemove}
            currentImageUrl={currentImageUrl}
            placeholder="아이템 이미지를 업로드하세요"
            disabled={uploading || loading}
            className="w-full"
          />

          {/* 또는 URL 입력 */}
          <div className="space-y-2">
            <Label htmlFor="image_url">또는 이미지 URL 입력</Label>
            <Input
              id="image_url"
              {...register('image_url')}
              placeholder="https://example.com/image.jpg"
            />
            {errors.image_url && (
              <p className="text-sm text-red-600">{errors.image_url.message}</p>
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
