import { supabase } from '@/lib/supabase'

export interface ImageUploadOptions {
  maxSize?: number // MB 단위
  allowedTypes?: string[]
  bucket?: string
  folder?: string
}

export interface ImageUploadResult {
  url: string
  path: string
  size: number
  name: string
}

export const imageService = {
  // 기본 이미지 업로드 옵션
  defaultOptions: {
    maxSize: 10, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    bucket: 'images',
    folder: 'general'
  },

  // 파일 검증
  validateFile(file: File, options: ImageUploadOptions = {}): void {
    const opts = { ...this.defaultOptions, ...options }

    // 파일 크기 검증
    const maxSizeBytes = opts.maxSize! * 1024 * 1024
    if (file.size > maxSizeBytes) {
      throw new Error(`파일 크기가 너무 큽니다. ${opts.maxSize}MB 이하의 파일만 업로드 가능합니다.`)
    }

    // 파일 형식 검증
    if (!opts.allowedTypes!.includes(file.type)) {
      throw new Error('지원하지 않는 파일 형식입니다. JPEG, PNG, WebP, GIF 파일만 업로드 가능합니다.')
    }
  },

  // 단일 이미지 업로드
  async uploadImage(
    file: File,
    options: ImageUploadOptions = {}
  ): Promise<ImageUploadResult> {
    const opts = { ...this.defaultOptions, ...options }

    // 파일 검증
    this.validateFile(file, opts)

    // 파일명 생성 (중복 방지)
    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2)
    const fileName = `${timestamp}-${randomString}.${fileExt}`
    const filePath = opts.folder ? `${opts.folder}/${fileName}` : fileName

    // Supabase Storage에 업로드
    const { error: uploadError } = await supabase.storage
      .from(opts.bucket!)
      .upload(filePath, file)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw new Error('이미지 업로드에 실패했습니다.')
    }

    // 공개 URL 가져오기
    const { data } = supabase.storage
      .from(opts.bucket!)
      .getPublicUrl(filePath)

    return {
      url: data.publicUrl,
      path: filePath,
      size: file.size,
      name: file.name
    }
  },

  // 여러 이미지 업로드
  async uploadImages(
    files: File[],
    options: ImageUploadOptions = {}
  ): Promise<ImageUploadResult[]> {
    const results: ImageUploadResult[] = []

    for (const file of files) {
      try {
        const result = await this.uploadImage(file, options)
        results.push(result)
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error)
        // 개별 파일 업로드 실패 시에도 계속 진행
        // 필요에 따라 에러 처리 로직 추가 가능
      }
    }

    return results
  },

  // 이미지 삭제
  async deleteImage(path: string, bucket: string = 'images'): Promise<void> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      console.error('Delete error:', error)
      throw new Error('이미지 삭제에 실패했습니다.')
    }
  },

  // 이미지 URL 검증 (Supabase Storage URL인지 확인)
  isValidImageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.includes('supabase') && urlObj.pathname.includes('/storage/v1/object/public/')
    } catch {
      return false
    }
  },

  // 이미지 정보 추출
  getImageInfo(url: string): { bucket: string; path: string } | null {
    if (!this.isValidImageUrl(url)) {
      return null
    }

    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/storage/v1/object/public/')[1].split('/')

      return {
        bucket: pathParts[0],
        path: pathParts.slice(1).join('/')
      }
    } catch {
      return null
    }
  }
}
