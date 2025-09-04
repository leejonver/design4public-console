'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Image as ImageIcon, FileImage } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export interface FileUploadProps {
  onFileSelect: (file: File) => void
  onFileRemove?: () => void
  currentImageUrl?: string | null
  placeholder?: string
  disabled?: boolean
  className?: string
  accept?: string
  maxSizeText?: string
  showPreview?: boolean
}

export function FileUpload({
  onFileSelect,
  onFileRemove,
  currentImageUrl,
  placeholder = "클릭하거나 파일을 드래그하세요",
  disabled = false,
  className,
  accept = "image/*",
  maxSizeText = "최대 5MB",
  showPreview = true,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback((file: File) => {
    // 파일 검증
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('지원하지 않는 파일 형식입니다. JPG, PNG, GIF, WebP 파일만 업로드 가능합니다.')
      return
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      alert('파일 크기가 너무 큽니다. 5MB 이하의 파일만 업로드 가능합니다.')
      return
    }

    // 미리보기 URL 생성
    if (showPreview) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }

    onFileSelect(file)
  }, [onFileSelect, showPreview])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [disabled])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleRemove = useCallback(() => {
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onFileRemove?.()
  }, [onFileRemove])

  const displayUrl = previewUrl || currentImageUrl

  return (
    <div className={cn("space-y-2", className)}>
      {/* 업로드 영역 */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg transition-colors cursor-pointer",
          isDragOver && !disabled
            ? "border-primary bg-primary/5"
            : displayUrl
            ? "border-gray-300"
            : "border-gray-300 hover:border-gray-400",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        {displayUrl && showPreview ? (
          // 이미지 미리보기
          <div className="relative">
            <img
              src={displayUrl}
              alt="업로드된 이미지"
              className="w-full h-48 object-cover rounded-lg"
              onError={() => setPreviewUrl(null)}
            />
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove()
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              클릭하여 변경
            </div>
          </div>
        ) : (
          // 파일 선택 영역
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Upload className="h-8 w-8 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 text-center mb-2">
              {placeholder}
            </p>
            <p className="text-xs text-gray-500">
              {maxSizeText} • JPG, PNG, GIF, WebP 지원
            </p>
          </div>
        )}
      </div>

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* 액션 버튼들 */}
      {!disabled && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClick}
            className="flex-1"
          >
            <FileImage className="h-4 w-4 mr-2" />
            파일 선택
          </Button>
          {displayUrl && onFileRemove && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4 mr-2" />
              제거
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// 다중 파일 업로드 컴포넌트
export interface MultiFileUploadProps {
  onFilesSelect: (files: File[]) => void
  onFileRemove: (index: number) => void
  currentImages?: Array<{ url: string; file?: File }>
  placeholder?: string
  disabled?: boolean
  className?: string
  accept?: string
  maxFiles?: number
  maxSizeText?: string
}

export function MultiFileUpload({
  onFilesSelect,
  onFileRemove,
  currentImages = [],
  placeholder = "클릭하거나 파일들을 드래그하세요",
  disabled = false,
  className,
  accept = "image/*",
  maxFiles = 10,
  maxSizeText = "최대 5MB씩",
}: MultiFileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFilesSelect = useCallback((files: File[]) => {
    const validFiles = files.filter(file => {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        alert(`${file.name}: 지원하지 않는 파일 형식입니다.`)
        return false
      }

      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        alert(`${file.name}: 파일 크기가 너무 큽니다.`)
        return false
      }

      return true
    })

    if (validFiles.length > 0) {
      onFilesSelect(validFiles)
    }
  }, [onFilesSelect])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFilesSelect(files)
    }
  }, [handleFilesSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [disabled])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFilesSelect(Array.from(files))
    }
  }, [handleFilesSelect])

  return (
    <div className={cn("space-y-2", className)}>
      {/* 업로드 영역 */}
      {currentImages.length < maxFiles && (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg transition-colors cursor-pointer",
            isDragOver && !disabled
              ? "border-primary bg-primary/5"
              : "border-gray-300 hover:border-gray-400",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <Upload className="h-8 w-8 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 text-center mb-2">
              {placeholder}
            </p>
            <p className="text-xs text-gray-500">
              {maxSizeText} • JPG, PNG, GIF, WebP 지원 • 최대 {maxFiles}개
            </p>
          </div>
        </div>
      )}

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* 선택된 파일들 미리보기 */}
      {currentImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentImages.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image.url}
                alt={`업로드 이미지 ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border"
              />
              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onFileRemove(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
