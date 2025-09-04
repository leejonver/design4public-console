'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import BrandForm from '@/components/features/BrandForm'
import { getBrandById, updateBrand } from '@/services/brandService'
import type { Brand, BrandUpdate } from '@/types/database-generated'

export default function EditBrandPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [brand, setBrand] = useState<Brand | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)

  const brandId = params.id as string

  useEffect(() => {
    loadBrand()
  }, [brandId])

  const loadBrand = async () => {
    try {
      setFetchLoading(true)
      const data = await getBrandById(brandId)
      setBrand(data)
    } catch (error: any) {
      console.error('Failed to load brand:', error)
      toast({
        title: '브랜드 로드 실패',
        description: error.message || '브랜드를 불러오는데 실패했습니다.',
        variant: 'destructive',
      })
      router.push('/brands')
    } finally {
      setFetchLoading(false)
    }
  }

  const handleSubmit = async (data: BrandUpdate) => {
    try {
      setLoading(true)
      await updateBrand(brandId, data)

      toast({
        title: '브랜드 수정 완료',
        description: '브랜드가 성공적으로 수정되었습니다.',
      })

      router.push('/brands')
    } catch (error: any) {
      console.error('Failed to update brand:', error)
      toast({
        title: '브랜드 수정 실패',
        description: error.message || '브랜드 수정 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/brands')
  }

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>브랜드를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!brand) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-muted-foreground">브랜드를 찾을 수 없습니다.</p>
          <Button onClick={() => router.push('/brands')} className="mt-4">
            브랜드 목록으로 돌아가기
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          뒤로가기
        </Button>
        <div>
          <h1 className="text-3xl font-bold">브랜드 수정</h1>
          <p className="text-muted-foreground">
            "{brand.name}" 브랜드 정보를 수정하세요.
          </p>
        </div>
      </div>

      {/* 브랜드 폼 */}
      <div className="max-w-4xl">
        <BrandForm
          brand={brand}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      </div>
    </div>
  )
}
