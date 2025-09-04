'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, X, Hash, Tag as TagIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { getTags } from '@/services/tagService'
import { addImageTag, removeImageTag, getImageTags } from '@/services/projectService'
import type { Tag } from '@/types/database-generated'

interface ImageTagManagerProps {
  imageId: string
  imageUrl: string
  imageAlt?: string
  onTagsChange?: (tags: Tag[]) => void
}

export default function ImageTagManager({
  imageId,
  imageUrl,
  imageAlt = '갤러리 이미지',
  onTagsChange
}: ImageTagManagerProps) {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [filteredTags, setFilteredTags] = useState<Tag[]>([])
  const [currentTags, setCurrentTags] = useState<Tag[]>([])
  const [loadingTags, setLoadingTags] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showTagSelector, setShowTagSelector] = useState(false)

  // 모든 태그와 현재 이미지의 태그 로드
  useEffect(() => {
    loadData()
  }, [imageId])

  // 검색어에 따라 필터링
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTags([])
    } else {
      const filtered = allTags.filter(tag =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).filter(tag => !currentTags.some(currentTag => currentTag.id === tag.id)) // 이미 추가된 태그 제외
      setFilteredTags(filtered.slice(0, 8)) // 최대 8개만 표시
    }
  }, [searchQuery, allTags, currentTags])

  const loadData = async () => {
    try {
      setLoadingTags(true)
      // 모든 태그 로드
      const [allTagsData, imageTagsData] = await Promise.all([
        getTags(),
        getImageTags(imageId)
      ])

      setAllTags(allTagsData)

      // 현재 이미지의 태그들 설정
      const currentTagObjects = imageTagsData.map((it: any) => it.tags).filter(Boolean)
      setCurrentTags(currentTagObjects)
    } catch (error) {
      console.error('Failed to load image tags data:', error)
      toast({
        title: '태그 로드 실패',
        description: '이미지 태그 정보를 불러오는데 실패했습니다.',
        variant: 'destructive',
      })
    } finally {
      setLoadingTags(false)
    }
  }

  const handleTagAdd = async (tagId: string) => {
    try {
      setActionLoading(tagId)
      await addImageTag(imageId, tagId)

      // 현재 태그 목록 업데이트
      const tagToAdd = allTags.find(tag => tag.id === tagId)
      if (tagToAdd) {
        const newCurrentTags = [...currentTags, tagToAdd]
        setCurrentTags(newCurrentTags)
        onTagsChange?.(newCurrentTags)
      }

      setSearchQuery('') // 검색어 초기화
      toast({
        title: '태그 추가 완료',
        description: '이미지에 태그가 추가되었습니다.',
      })
    } catch (error: any) {
      console.error('Failed to add tag to image:', error)
      toast({
        title: '태그 추가 실패',
        description: error.message || '태그 추가에 실패했습니다.',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleTagRemove = async (tagId: string) => {
    try {
      setActionLoading(tagId)
      await removeImageTag(imageId, tagId)

      // 현재 태그 목록에서 제거
      const newCurrentTags = currentTags.filter(tag => tag.id !== tagId)
      setCurrentTags(newCurrentTags)
      onTagsChange?.(newCurrentTags)

      toast({
        title: '태그 제거 완료',
        description: '이미지에서 태그가 제거되었습니다.',
      })
    } catch (error: any) {
      console.error('Failed to remove tag from image:', error)
      toast({
        title: '태그 제거 실패',
        description: error.message || '태그 제거에 실패했습니다.',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <TagIcon className="h-4 w-4" />
              이미지 태그 관리
            </CardTitle>
            <CardDescription>
              이 이미지에 적용할 태그들을 관리하세요.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTagSelector(!showTagSelector)}
          >
            {showTagSelector ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 이미지 미리보기 */}
        <div className="flex justify-center">
          <img
            src={imageUrl}
            alt={imageAlt}
            className="w-full max-w-sm h-32 object-cover rounded-lg border"
          />
        </div>

        {/* 현재 태그들 */}
        {currentTags.length > 0 && (
          <div className="space-y-2">
            <Label>적용된 태그</Label>
            <div className="flex flex-wrap gap-2">
              {currentTags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  <Hash className="h-3 w-3" />
                  <span>{tag.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTagRemove(tag.id)}
                    disabled={actionLoading === tag.id}
                    className="h-4 w-4 p-0 hover:bg-primary/20"
                  >
                    {actionLoading === tag.id ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-primary"></div>
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 태그 검색 및 추가 */}
        {showTagSelector && (
          <div className="space-y-3 border-t pt-4">
            <div className="space-y-2">
              <Label htmlFor={`tag-search-${imageId}`}>태그 검색</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id={`tag-search-${imageId}`}
                  placeholder="태그명으로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  disabled={loadingTags}
                />
              </div>
            </div>

            {/* 검색 결과 */}
            {searchQuery.trim() && (
              <div className="space-y-2">
                <Label>검색 결과</Label>
                {loadingTags ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  </div>
                ) : filteredTags.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    검색 결과가 없습니다.
                  </div>
                ) : (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {filteredTags.map((tag) => (
                      <div
                        key={tag.id}
                        className="flex items-center justify-between p-2 border rounded hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          <Hash className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{tag.name}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleTagAdd(tag.id)}
                          disabled={actionLoading === tag.id}
                          className="h-6 w-6 p-0"
                        >
                          {actionLoading === tag.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                          ) : (
                            <Plus className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
