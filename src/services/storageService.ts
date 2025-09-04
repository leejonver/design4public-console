import { supabase } from '@/lib/supabase'

export interface UploadResult {
  url: string
  path: string
  fileName: string
}

// Storage 버킷 이름들
export const BUCKETS = {
  PROJECT_IMAGES: 'project-images',
  ITEM_IMAGES: 'item-images',
  BRAND_IMAGES: 'brand-images',
  PROJECT_COVERS: 'project-covers',
  BRAND_COVERS: 'brand-covers',
} as const

// 버킷 생성 (존재하지 않을 경우)
export const createBucketIfNotExists = async (bucketName: string): Promise<void> => {
  try {
    // 버킷 목록 가져오기
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error('Failed to list buckets:', listError)
      return
    }

    // 버킷이 존재하는지 확인
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName)

    if (!bucketExists) {
      // 버킷 생성
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true, // 공개 버킷으로 설정
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880, // 5MB
      })

      if (createError) {
        console.error(`Failed to create bucket ${bucketName}:`, createError)
      } else {
        console.log(`Bucket ${bucketName} created successfully`)
      }
    }
  } catch (error) {
    console.error('Failed to create bucket:', error)
  }
}

// 파일 업로드
export const uploadFile = async (
  file: File,
  bucket: string,
  folder?: string
): Promise<UploadResult> => {
  try {
    // 버킷이 존재하는지 확인하고 없으면 생성
    await createBucketIfNotExists(bucket)

    // 파일명에 타임스탬프 추가하여 중복 방지
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = folder ? `${folder}/${fileName}` : fileName

    // 파일 업로드
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      throw new Error(`파일 업로드 실패: ${error.message}`)
    }

    // 공개 URL 가져오기
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return {
      url: publicUrl,
      path: data.path,
      fileName: file.name,
    }
  } catch (error) {
    console.error('File upload failed:', error)
    throw error
  }
}

// 파일 삭제
export const deleteFile = async (
  bucket: string,
  filePath: string
): Promise<void> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      throw new Error(`파일 삭제 실패: ${error.message}`)
    }
  } catch (error) {
    console.error('File delete failed:', error)
    throw error
  }
}

// 파일 존재 여부 확인
export const fileExists = async (
  bucket: string,
  filePath: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list('', {
        limit: 1,
        search: filePath
      })

    if (error) {
      console.error('File check error:', error)
      return false
    }

    return data && data.length > 0
  } catch (error) {
    console.error('File existence check failed:', error)
    return false
  }
}

// 파일 URL에서 경로 추출
export const extractPathFromUrl = (url: string, bucket: string): string | null => {
  try {
    const urlObj = new URL(url)
    const path = urlObj.pathname.replace(`/storage/v1/object/public/${bucket}/`, '')
    return decodeURIComponent(path)
  } catch (error) {
    console.error('Failed to extract path from URL:', error)
    return null
  }
}

// 이미지 파일 검증
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  // 파일 타입 검증
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: '지원하지 않는 파일 형식입니다. JPG, PNG, GIF, WebP 파일만 업로드 가능합니다.'
    }
  }

  // 파일 크기 검증 (5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: '파일 크기가 너무 큽니다. 5MB 이하의 파일만 업로드 가능합니다.'
    }
  }

  return { isValid: true }
}

// 여러 파일 업로드
export const uploadMultipleFiles = async (
  files: File[],
  bucket: string,
  folder?: string
): Promise<UploadResult[]> => {
  const uploadPromises = files.map(file => uploadFile(file, bucket, folder))
  return Promise.all(uploadPromises)
}

// 프로젝트 이미지 업로드
export const uploadProjectImage = async (file: File): Promise<UploadResult> => {
  return uploadFile(file, BUCKETS.PROJECT_IMAGES, 'projects')
}

// 프로젝트 커버 이미지 업로드
export const uploadProjectCover = async (file: File): Promise<UploadResult> => {
  return uploadFile(file, BUCKETS.PROJECT_COVERS, 'covers')
}

// 아이템 이미지 업로드
export const uploadItemImage = async (file: File): Promise<UploadResult> => {
  return uploadFile(file, BUCKETS.ITEM_IMAGES, 'items')
}

// 브랜드 이미지 업로드
export const uploadBrandImage = async (file: File): Promise<UploadResult> => {
  return uploadFile(file, BUCKETS.BRAND_IMAGES, 'brands')
}

// 브랜드 커버 이미지 업로드
export const uploadBrandCover = async (file: File): Promise<UploadResult> => {
  return uploadFile(file, BUCKETS.BRAND_COVERS, 'covers')
}

// 파일 삭제 헬퍼 함수들
export const deleteProjectImage = async (filePath: string): Promise<void> => {
  return deleteFile(BUCKETS.PROJECT_IMAGES, filePath)
}

export const deleteProjectCover = async (filePath: string): Promise<void> => {
  return deleteFile(BUCKETS.PROJECT_COVERS, filePath)
}

export const deleteItemImage = async (filePath: string): Promise<void> => {
  return deleteFile(BUCKETS.ITEM_IMAGES, filePath)
}

export const deleteBrandImage = async (filePath: string): Promise<void> => {
  return deleteFile(BUCKETS.BRAND_IMAGES, filePath)
}

export const deleteBrandCover = async (filePath: string): Promise<void> => {
  return deleteFile(BUCKETS.BRAND_COVERS, filePath)
}
