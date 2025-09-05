'use client'

import { useState, useEffect } from 'react'
import { Card, FormLayout, TextField, Button, Banner, Text } from '@shopify/polaris'
import { tagService } from '@/services/tagService'
import type { TagInsert, TagUpdate, Tag } from '@/types/database'

interface TagFormProps {
  tag?: Tag
  onSuccess: () => void
  onCancel: () => void
}

export function TagForm({ tag, onSuccess, onCancel }: TagFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkingDuplicate, setCheckingDuplicate] = useState(false)

  const [formData, setFormData] = useState({
    name: tag?.name || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 중복 체크
      const exists = await tagService.checkTagExists(
        formData.name.trim(),
        tag?.id
      )

      if (exists) {
        throw new Error('이미 존재하는 태그명입니다.')
      }

      const data: TagInsert = {
        name: formData.name.trim()
      }

      if (tag) {
        // 수정
        await tagService.updateTag(tag.id, data as TagUpdate)
      } else {
        // 생성
        await tagService.createTag(data)
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : '태그 저장 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // 실시간 중복 체크
  useEffect(() => {
    const checkDuplicate = async () => {
      if (!formData.name.trim()) return

      setCheckingDuplicate(true)
      try {
        const exists = await tagService.checkTagExists(
          formData.name.trim(),
          tag?.id
        )
        if (exists) {
          setError('이미 존재하는 태그명입니다.')
        } else {
          setError(null)
        }
      } catch (err) {
        // 중복 체크 실패는 무시
      } finally {
        setCheckingDuplicate(false)
      }
    }

    const timeoutId = setTimeout(checkDuplicate, 500)
    return () => clearTimeout(timeoutId)
  }, [formData.name, tag?.id])

  return (
    <Card>
      <div className="p-6">
        <div className="mb-6">
          <Text variant="headingLg" as="h1">
            {tag ? '태그 수정' : '새 태그'}
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
              label="태그명"
              value={formData.name}
              onChange={handleChange('name')}
              required
              placeholder="태그 이름을 입력하세요"
              helpText="태그명은 중복될 수 없습니다."
            />

            <div className="flex gap-3 pt-4">
              <Button
                primary
                submit
                loading={loading}
                disabled={!formData.name.trim() || !!error || checkingDuplicate}
              >
                {tag ? '수정하기' : '생성하기'}
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
