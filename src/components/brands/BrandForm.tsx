'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, FormLayout, TextField, Button, Banner, Text, DropZone, Thumbnail, Stack, Icon } from '@shopify/polaris'
import { brandService } from '@/services/brandService'
import type { BrandInsert, BrandUpdate, Brand } from '@/types/database'

interface BrandFormProps {
  brand?: Brand
  onSuccess: () => void
  onCancel: () => void
}

export function BrandForm({ brand, onSuccess, onCancel }: BrandFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)

  const logoFileInputRef = useRef<HTMLInputElement>(null)
  const coverFileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: brand?.name || '',
    description: brand?.description || '',
    logo_url: brand?.logo_url || '',
    cover_image_url: brand?.cover_image_url || '',
    website_url: brand?.website_url || ''
  })

  // 이미지 미리보기 상태
  const [logoPreview, setLogoPreview] = useState<string>(brand?.logo_url || '')
  const [coverPreview, setCoverPreview] = useState<string>(brand?.cover_image_url || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 브랜드명 중복 체크
      if (!brand || formData.name !== brand.name) {
        const exists = await brandService.checkBrandExists(formData.name, brand?.id)
        if (exists) {
          throw new Error('이미 존재하는 브랜드명입니다.')
        }
      }

      const data: BrandInsert = {
        name: formData.name,
        description: formData.description || null,
        cover_image_url: formData.cover_image_url || null,
        website_url: formData.website_url || null
      }

      if (brand) {
        // 수정
        await brandService.updateBrand(brand.id, data as BrandUpdate)
      } else {
        // 생성
        await brandService.createBrand(data)
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : '브랜드 저장 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // 로고 이미지 업로드 핸들러
  const handleLogoFileSelect = async (files: File[]) => {
    if (!files.length) return

    setUploadingLogo(true)
    setError(null)

    try {
      const file = files[0]
      if (file.size > 5 * 1024 * 1024) { // 5MB 제한
        throw new Error('로고 파일이 너무 큽니다. 5MB 이하의 파일만 업로드 가능합니다.')
      }
      if (!file.type.startsWith('image/')) {
        throw new Error('이미지 파일만 업로드 가능합니다.')
      }

      // 미리보기 생성
      const previewUrl = URL.createObjectURL(file)
      setLogoPreview(previewUrl)

      // 실제로는 Supabase Storage에 업로드
      // 여기서는 테스트용으로 미리보기 URL을 사용
      setFormData(prev => ({ ...prev, logo_url: previewUrl }))

    } catch (err) {
      setError(err instanceof Error ? err.message : '로고 업로드 중 오류가 발생했습니다.')
    } finally {
      setUploadingLogo(false)
    }
  }

  // 커버 이미지 업로드 핸들러
  const handleCoverFileSelect = async (files: File[]) => {
    if (!files.length) return

    setUploadingCover(true)
    setError(null)

    try {
      const file = files[0]
      if (file.size > 10 * 1024 * 1024) { // 10MB 제한
        throw new Error('커버 파일이 너무 큽니다. 10MB 이하의 파일만 업로드 가능합니다.')
      }
      if (!file.type.startsWith('image/')) {
        throw new Error('이미지 파일만 업로드 가능합니다.')
      }

      // 미리보기 생성
      const previewUrl = URL.createObjectURL(file)
      setCoverPreview(previewUrl)

      // 실제로는 Supabase Storage에 업로드
      // 여기서는 테스트용으로 미리보기 URL을 사용
      setFormData(prev => ({ ...prev, cover_image_url: previewUrl }))

    } catch (err) {
      setError(err instanceof Error ? err.message : '커버 이미지 업로드 중 오류가 발생했습니다.')
    } finally {
      setUploadingCover(false)
    }
  }

  // 이미지 제거 핸들러
  const handleRemoveLogo = () => {
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview)
    }
    setLogoPreview('')
    setFormData(prev => ({ ...prev, logo_url: '' }))
  }

  const handleRemoveCover = () => {
    if (coverPreview) {
      URL.revokeObjectURL(coverPreview)
    }
    setCoverPreview('')
    setFormData(prev => ({ ...prev, cover_image_url: '' }))
  }

  return (
    <Card>
      <div className="p-6">
        <div className="mb-6">
          <Text variant="headingLg" as="h1">
            {brand ? '브랜드 수정' : '새 브랜드'}
          </Text>
        </div>

        {error && (
          <div className="mb-4">
            <Banner status="critical">
              {error}
            </Banner>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <FormLayout>
            <TextField
              label="브랜드명"
              value={formData.name}
              onChange={handleChange('name')}
              required
              placeholder="브랜드 이름을 입력하세요"
            />

            <TextField
              label="설명"
              value={formData.description}
              onChange={handleChange('description')}
              multiline={3}
              placeholder="브랜드 설명을 입력하세요"
            />

            {/* 로고 이미지 업로드 섹션 */}
            <div className="space-y-4">
              <Text variant="headingMd" as="h3">
                브랜드 로고
              </Text>

              {formData.logo_url ? (
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Thumbnail
                      source={formData.logo_url}
                      alt="브랜드 로고"
                      size="large"
                    />
                    {/* 원형 스타일 적용 */}
                    <div className="absolute inset-0 rounded-full border-4 border-white shadow-lg" style={{
                      backgroundImage: `url(${formData.logo_url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%'
                    }} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      size="slim"
                      destructive
                      onClick={handleRemoveLogo}
                    >
                      로고 제거
                    </Button>
                  </div>
                </div>
              ) : (
                <DropZone
                  accept="image/*"
                  type="file"
                  onDrop={handleLogoFileSelect}
                  disabled={uploadingLogo}
                >
                  <DropZone.FileUpload
                    actionHint="또는 파일을 클릭해서 선택"
                  />
                </DropZone>
              )}

              {uploadingLogo && (
                <Text variant="bodySm" color="subdued">
                  로고 업로드 중...
                </Text>
              )}
            </div>

            {/* 커버 이미지 업로드 섹션 */}
            <div className="space-y-4">
              <Text variant="headingMd" as="h3">
                커버 이미지
              </Text>

              {formData.cover_image_url ? (
                <div className="flex items-center gap-4">
                  <Thumbnail
                    source={formData.cover_image_url}
                    alt="커버 이미지"
                    size="large"
                  />
                  <div className="flex flex-col gap-2">
                    <Button
                      size="slim"
                      destructive
                      onClick={handleRemoveCover}
                    >
                      커버 이미지 제거
                    </Button>
                  </div>
                </div>
              ) : (
                <DropZone
                  accept="image/*"
                  type="file"
                  onDrop={handleCoverFileSelect}
                  disabled={uploadingCover}
                >
                  <DropZone.FileUpload
                    actionHint="또는 파일을 클릭해서 선택"
                  />
                </DropZone>
              )}

              {uploadingCover && (
                <Text variant="bodySm" color="subdued">
                  커버 이미지 업로드 중...
                </Text>
              )}
            </div>

            <TextField
              label="웹사이트 URL"
              type="url"
              value={formData.website_url}
              onChange={handleChange('website_url')}
              placeholder="https://example.com"
            />

            <div className="flex gap-3 pt-4">
              <Button
                primary
                submit
                loading={loading}
                disabled={!formData.name.trim()}
              >
                {brand ? '수정하기' : '생성하기'}
              </Button>

              <Button
                onClick={onCancel}
              >
                취소
              </Button>
            </div>
          </FormLayout>
        </form>
      </div>
    </Card>
  )
}
