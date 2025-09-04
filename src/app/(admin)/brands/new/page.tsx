'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import BrandForm from '@/components/features/BrandForm'
import { createBrand } from '@/services/brandService'
import type { BrandInsert } from '@/types/database-generated'

export default function NewBrandPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: BrandInsert) => {
    try {
      setLoading(true)
      await createBrand(data)

      toast({
        title: '브랜드 생성 완료',
        description: '새 브랜드가 성공적으로 생성되었습니다.',
      })

      router.push('/brands')
    } catch (error: any) {
      console.error('Failed to create brand:', error)
      toast({
        title: '브랜드 생성 실패',
        description: error.message || '브랜드 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/brands')
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
          <h1 className="text-3xl font-bold">새 브랜드 추가</h1>
          <p className="text-muted-foreground">
            새로운 가구 브랜드를 등록하세요.
          </p>
        </div>
      </div>

      {/* 브랜드 폼 */}
      <div className="max-w-4xl">
        <BrandForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      </div>
    </div>
  )
}
