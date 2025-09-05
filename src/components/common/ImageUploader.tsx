'use client'

import { useState, useRef, useCallback } from 'react'
import {
  DropZone,
  Thumbnail,
  Button,
  Text,
  Stack,
  Card,
  Banner,
  ProgressBar,
  Icon
} from '@shopify/polaris'
import { imageService, ImageUploadResult, ImageUploadOptions } from '@/services/imageService'

export interface ImageUploaderProps {
  onImagesUploaded?: (results: ImageUploadResult[]) => void
  onImageRemoved?: (index: number) => void
  initialImages?: string[]
  maxFiles?: number
  options?: ImageUploadOptions
  disabled?: boolean
  multiple?: boolean
}

export function ImageUploader({
  onImagesUploaded,
  onImageRemoved,
  initialImages = [],
  maxFiles = 10,
  options = {},
  disabled = false,
  multiple = true
}: ImageUploaderProps) {
  const [uploadedImages, setUploadedImages] = useState<ImageUploadResult[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 초기 이미지들을 업로드된 이미지로 변환
  const initializeImages = useCallback(() => {
    const initialResults: ImageUploadResult[] = initialImages.map((url, index) => ({
      url,
      path: `initial-${index}`,
      size: 0,
      name: `초기 이미지 ${index + 1}`
    }))
    setUploadedImages(initialResults)
  }, [initialImages])

  // 컴포넌트 마운트 시 초기 이미지 설정
  useState(() => {
    initializeImages()
  })

  // 파일 선택 핸들러
  const handleFileSelect = useCallback(async (files: File[]) => {
    if (disabled) return

    setError(null)
    setUploading(true)
    setUploadProgress(0)

    try {
      // 최대 파일 수 체크
      const totalFiles = uploadedImages.length + files.length
      if (totalFiles > maxFiles) {
        throw new Error(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`)
      }

      // 파일 검증
      for (const file of files) {
        imageService.validateFile(file, options)
      }

      // 업로드 진행률 계산을 위한 프로그레스 설정
      let completedUploads = 0
      const totalUploads = files.length

      const uploadPromises = files.map(async (file) => {
        try {
          const result = await imageService.uploadImage(file, options)
          completedUploads++
          setUploadProgress((completedUploads / totalUploads) * 100)
          return result
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error)
          completedUploads++
          setUploadProgress((completedUploads / totalUploads) * 100)
          throw error
        }
      })

      const results = await Promise.allSettled(uploadPromises)
      const successfulUploads = results
        .filter((result): result is PromiseFulfilledResult<ImageUploadResult> =>
          result.status === 'fulfilled'
        )
        .map(result => result.value)

      const failedUploads = results.filter(result => result.status === 'rejected')

      // 성공한 업로드들 추가
      if (successfulUploads.length > 0) {
        const newImages = [...uploadedImages, ...successfulUploads]
        setUploadedImages(newImages)
        onImagesUploaded?.(successfulUploads)
      }

      // 실패한 업로드가 있다면 에러 메시지 표시
      if (failedUploads.length > 0) {
        setError(`${failedUploads.length}개의 파일 업로드에 실패했습니다.`)
      }

    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : '업로드 중 오류가 발생했습니다.')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [uploadedImages, maxFiles, options, disabled, onImagesUploaded])

  // 이미지 제거 핸들러
  const handleRemoveImage = useCallback(async (index: number) => {
    const imageToRemove = uploadedImages[index]

    try {
      // Supabase Storage에서 실제 파일 삭제 (초기 이미지가 아닌 경우에만)
      if (!imageToRemove.path.startsWith('initial-')) {
        await imageService.deleteImage(imageToRemove.path, options.bucket || 'images')
      }

      const newImages = [...uploadedImages]
      newImages.splice(index, 1)
      setUploadedImages(newImages)
      onImageRemoved?.(index)
    } catch (error) {
      console.error('Delete error:', error)
      setError('이미지 삭제에 실패했습니다.')
    }
  }, [uploadedImages, options.bucket, onImageRemoved])

  // DropZone 파일 드롭 핸들러
  const handleDrop = useCallback((files: File[]) => {
    handleFileSelect(files)
  }, [handleFileSelect])

  // 파일 입력 변경 핸들러
  const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      handleFileSelect(Array.from(files))
    }
  }, [handleFileSelect])

  return (
    <div className="space-y-4">
      {/* 에러 메시지 */}
      {error && (
        <Banner status="critical">
          {error}
        </Banner>
      )}

      {/* 업로드 진행률 */}
      {uploading && (
        <Card>
          <div className="p-4">
            <Text variant="headingMd" as="h3">
              업로드 중...
            </Text>
            <div className="mt-2">
              <ProgressBar progress={uploadProgress} />
            </div>
            <Text variant="bodySm" color="subdued">
              {Math.round(uploadProgress)}% 완료
            </Text>
          </div>
        </Card>
      )}

      {/* 파일 드롭존 */}
      <DropZone
        accept="image/*"
        type="file"
        onDrop={handleDrop}
        disabled={disabled || uploading || uploadedImages.length >= maxFiles}
        allowMultiple={multiple}
      >
        <DropZone.FileUpload
          actionHint={
            uploadedImages.length >= maxFiles
              ? `최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`
              : multiple
                ? "또는 파일을 클릭해서 선택"
                : "또는 파일을 클릭해서 선택"
          }
        />
      </DropZone>

      {/* 업로드된 이미지들 */}
      {uploadedImages.length > 0 && (
        <div className="space-y-4">
          <Text variant="headingMd" as="h3">
            업로드된 이미지 ({uploadedImages.length}/{maxFiles})
          </Text>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map((image, index) => (
              <Card key={index}>
                <div className="p-4">
                  <div className="relative">
                    <Thumbnail
                      source={image.url}
                      alt={image.name}
                      size="large"
                    />

                    {/* 제거 버튼 */}
                    {!disabled && (
                      <div className="absolute top-2 right-2">
                        <Button
                          size="slim"
                          destructive
                          onClick={() => handleRemoveImage(index)}
                          disabled={uploading}
                        >
                          제거
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* 이미지 정보 */}
                  <div className="mt-2">
                    <Text variant="bodySm" fontWeight="bold">
                      {image.name}
                    </Text>
                    <Text variant="bodySm" color="subdued">
                      {(image.size / 1024 / 1024).toFixed(2)} MB
                    </Text>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 히든 파일 입력 (필요시 사용) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || uploading}
      />
    </div>
  )
}
