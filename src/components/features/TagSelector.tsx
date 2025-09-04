'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, X, Hash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { getTags } from '@/services/tagService'
import type { Tag } from '@/types/database-generated'

interface TagSelectorProps {
  projectId: string
  onTagAdd: (tagId: string) => Promise<void>
  onTagRemove: (tagId: string) => Promise<void>
  connectedTagIds: string[]
  loading?: boolean
}

export default function TagSelector({
  projectId,
  onTagAdd,
  onTagRemove,
  connectedTagIds,
  loading = false
}: TagSelectorProps) {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [filteredTags, setFilteredTags] = useState<Tag[]>([])
  const [loadingTags, setLoadingTags] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // 모든 태그 로드
  useEffect(() => {
    loadTags()
  }, [])

  // 검색어에 따라 필터링
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTags([])
    } else {
      const filtered = allTags.filter(tag =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).filter(tag => !connectedTagIds.includes(tag.id)) // 이미 연결된 태그 제외
      setFilteredTags(filtered.slice(0, 10)) // 최대 10개만 표시
    }
  }, [searchQuery, allTags, connectedTagIds])

  const loadTags = async () => {
    try {
      setLoadingTags(true)
      const data = await getTags()
      setAllTags(data)
    } catch (error) {
      console.error('Failed to load tags:', error)
      toast({
        title: '태그 로드 실패',
        description: '태그 목록을 불러오는데 실패했습니다.',
        variant: 'destructive',
      })
    } finally {
      setLoadingTags(false)
    }
  }

  const handleTagAdd = async (tagId: string) => {
    try {
      setActionLoading(tagId)
      await onTagAdd(tagId)
      setSearchQuery('') // 검색어 초기화
      toast({
        title: '태그 추가 완료',
        description: '프로젝트에 태그가 추가되었습니다.',
      })
    } catch (error: any) {
      console.error('Failed to add tag:', error)
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
      await onTagRemove(tagId)
      toast({
        title: '태그 제거 완료',
        description: '프로젝트에서 태그가 제거되었습니다.',
      })
    } catch (error: any) {
      console.error('Failed to remove tag:', error)
      toast({
        title: '태그 제거 실패',
        description: error.message || '태그 제거에 실패했습니다.',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }

  // 연결된 태그들 가져오기
  const connectedTags = allTags.filter(tag => connectedTagIds.includes(tag.id))

  return (
    <div className="space-y-6">
      {/* 태그 검색 및 추가 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            태그 검색 및 추가
          </CardTitle>
          <CardDescription>
            프로젝트를 분류하기 위한 태그를 검색하여 추가하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 검색 입력 */}
          <div className="space-y-2">
            <Label htmlFor="tag-search">태그 검색</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="tag-search"
                placeholder="태그명으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                disabled={loading || loadingTags}
              />
            </div>
          </div>

          {/* 검색 결과 */}
          {searchQuery.trim() && (
            <div className="space-y-2">
              <Label>검색 결과</Label>
              {loadingTags ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : filteredTags.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  검색 결과가 없습니다.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredTags.map((tag) => (
                    <div
                      key={tag.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{tag.name}</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleTagAdd(tag.id)}
                        disabled={actionLoading === tag.id}
                      >
                        {actionLoading === tag.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 연결된 태그들 */}
      {connectedTags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              연결된 태그 ({connectedTags.length})
            </CardTitle>
            <CardDescription>
              이 프로젝트에 적용된 태그들입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {connectedTags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-full"
                >
                  <Hash className="h-3 w-3" />
                  <span className="text-sm font-medium">{tag.name}</span>
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
          </CardContent>
        </Card>
      )}
    </div>
  )
}
