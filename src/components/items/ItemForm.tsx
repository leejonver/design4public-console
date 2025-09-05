'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, FormLayout, TextField, Select, Button, Banner, Text, DropZone, Thumbnail } from '@shopify/polaris'
import { itemService } from '@/services/itemService'
import { brandService } from '@/services/brandService'
import type { ItemInsert, ItemUpdate, Item, Brand } from '@/types/database'

interface ItemFormProps {
  item?: Item
  onSuccess: () => void
  onCancel: () => void
}

export function ItemForm({ item, onSuccess, onCancel }: ItemFormProps) {
  const [loading, setLoading] = useState(false)
  const [brands, setBrands] = useState<Brand[]>([])
  const [error, setError] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    brand_id: item?.brand_id || '',
    nara_url: item?.nara_url || '',
    image_url: item?.image_url || ''
  })

  // 이미지 미리보기 상태
  const [imagePreview, setImagePreview] = useState<string>(item?.image_url || '')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // 브랜드 목록 로드
  useEffect(() => {
    // 임시 브랜드 데이터
    const testBrands = [
      {
        id: 'brand1',
        name: '테스트 브랜드',
        description: '테스트용 브랜드입니다.',
        cover_image_url: null,
        logo_url: null,
        website_url: 'https://test-brand.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'brand2',
        name: '모던퍼니처',
        description: '현대적인 디자인의 가구 브랜드',
        cover_image_url: null,
        logo_url: null,
        website_url: 'https://modern-furniture.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
    setBrands(testBrands)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let imageUrl = formData.image_url

      // 새로 선택된 파일이 있으면 업로드
      if (selectedFile) {
        try {
          imageUrl = await itemService.uploadItemImage(selectedFile, item?.id)
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError)
          // 이미지 업로드 실패해도 아이템 저장은 계속 진행
        }
      }

      const data: ItemInsert = {
        name: formData.name,
        description: formData.description || null,
        brand_id: formData.brand_id || null,
        nara_url: formData.nara_url || null,
        image_url: imageUrl || null
      }

      if (item) {
        // 수정
        await itemService.updateItem(item.id, data as ItemUpdate)
      } else {
        // 생성
        await itemService.createItem(data)
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : '아이템 저장 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // 이미지 파일 선택 핸들러
  const handleFileSelect = async (files: File[]) => {
    if (!files.length) return

    setUploadingImage(true)
    setError(null)

    try {
      const file = files[0]
      if (file.size > 10 * 1024 * 1024) { // 10MB 제한
        throw new Error('이미지 파일이 너무 큽니다. 10MB 이하의 파일만 업로드 가능합니다.')
      }
      if (!file.type.startsWith('image/')) {
        throw new Error('이미지 파일만 업로드 가능합니다.')
      }

      // 미리보기 생성
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
      setSelectedFile(file)

      // 기존 URL 제거
      setFormData(prev => ({ ...prev, image_url: '' }))

    } catch (err) {
      setError(err instanceof Error ? err.message : '파일 선택 중 오류가 발생했습니다.')
    } finally {
      setUploadingImage(false)
    }
  }

  // 이미지 제거 핸들러
  const handleRemoveImage = () => {
    if (imagePreview && selectedFile) {
      URL.revokeObjectURL(imagePreview)
    }
    setImagePreview('')
    setSelectedFile(null)
    setFormData(prev => ({ ...prev, image_url: '' }))
  }

  // 브랜드 옵션 생성
  const brandOptions = [
    { label: '브랜드 선택 안함', value: '' },
    ...brands.map(brand => ({
      label: brand.name,
      value: brand.id
    }))
  ]

  return (
    <Card>
      <div className="p-6">
        <div className="mb-6">
          <Text variant="headingLg" as="h1">
            {item ? '아이템 수정' : '새 아이템'}
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
              label="아이템명"
              value={formData.name}
              onChange={handleChange('name')}
              required
              placeholder="아이템 이름을 입력하세요"
            />

            <TextField
              label="설명"
              value={formData.description}
              onChange={handleChange('description')}
              multiline={3}
              placeholder="아이템 설명을 입력하세요"
            />

            <Select
              label="브랜드"
              options={brandOptions}
              value={formData.brand_id}
              onChange={handleChange('brand_id')}
              placeholder="브랜드를 선택하세요"
            />

            <TextField
              label="나라장터 URL"
              type="url"
              value={formData.nara_url}
              onChange={handleChange('nara_url')}
              placeholder="https://www.g2b.go.kr/..."
            />

            {/* 아이템 이미지 업로드 섹션 */}
            <div className="space-y-4">
              <Text variant="headingMd" as="h3">
                아이템 이미지
              </Text>

              {/* 이미지 업로드 드롭존 */}
              <DropZone
                accept="image/*"
                type="file"
                onDrop={handleFileSelect}
                disabled={uploadingImage}
              >
                <DropZone.FileUpload
                  actionHint="또는 파일을 클릭해서 선택"
                />
              </DropZone>

              {/* 업로드된 이미지 미리보기 */}
              {imagePreview && (
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <Thumbnail
                    source={imagePreview}
                    alt="아이템 이미지"
                    size="large"
                  />
                  <div className="flex-1">
                    <Text variant="bodyMd" fontWeight="bold">
                      선택된 이미지
                    </Text>
                    <Text variant="bodySm" color="subdued">
                      {selectedFile ? selectedFile.name : '기존 이미지'}
                    </Text>
                  </div>
                  <Button
                    size="slim"
                    destructive
                    onClick={handleRemoveImage}
                  >
                    제거
                  </Button>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                primary
                submit
                loading={loading}
                disabled={!formData.name.trim()}
              >
                {item ? '수정하기' : '생성하기'}
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
