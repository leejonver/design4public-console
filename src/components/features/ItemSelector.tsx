'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, X, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { getItems } from '@/services/itemService'
import type { Item } from '@/types/database-generated'

interface ItemSelectorProps {
  projectId: string
  onItemAdd: (itemId: string) => Promise<void>
  onItemRemove: (itemId: string) => Promise<void>
  connectedItemIds: string[]
  loading?: boolean
}

export default function ItemSelector({
  projectId,
  onItemAdd,
  onItemRemove,
  connectedItemIds,
  loading = false
}: ItemSelectorProps) {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [allItems, setAllItems] = useState<Item[]>([])
  const [filteredItems, setFilteredItems] = useState<Item[]>([])
  const [loadingItems, setLoadingItems] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // 모든 아이템 로드
  useEffect(() => {
    loadItems()
  }, [])

  // 검색어에 따라 필터링
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredItems([])
    } else {
      const filtered = allItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brands?.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).filter(item => !connectedItemIds.includes(item.id)) // 이미 연결된 아이템 제외
      setFilteredItems(filtered.slice(0, 10)) // 최대 10개만 표시
    }
  }, [searchQuery, allItems, connectedItemIds])

  const loadItems = async () => {
    try {
      setLoadingItems(true)
      const data = await getItems()
      setAllItems(data)
    } catch (error) {
      console.error('Failed to load items:', error)
      toast({
        title: '아이템 로드 실패',
        description: '아이템 목록을 불러오는데 실패했습니다.',
        variant: 'destructive',
      })
    } finally {
      setLoadingItems(false)
    }
  }

  const handleItemAdd = async (itemId: string) => {
    try {
      setActionLoading(itemId)
      await onItemAdd(itemId)
      setSearchQuery('') // 검색어 초기화
      toast({
        title: '아이템 추가 완료',
        description: '프로젝트에 아이템이 추가되었습니다.',
      })
    } catch (error: any) {
      console.error('Failed to add item:', error)
      toast({
        title: '아이템 추가 실패',
        description: error.message || '아이템 추가에 실패했습니다.',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleItemRemove = async (itemId: string) => {
    try {
      setActionLoading(itemId)
      await onItemRemove(itemId)
      toast({
        title: '아이템 제거 완료',
        description: '프로젝트에서 아이템이 제거되었습니다.',
      })
    } catch (error: any) {
      console.error('Failed to remove item:', error)
      toast({
        title: '아이템 제거 실패',
        description: error.message || '아이템 제거에 실패했습니다.',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }

  // 연결된 아이템들 가져오기
  const connectedItems = allItems.filter(item => connectedItemIds.includes(item.id))

  return (
    <div className="space-y-6">
      {/* 아이템 검색 및 추가 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            아이템 검색 및 추가
          </CardTitle>
          <CardDescription>
            프로젝트에 사용할 가구 아이템을 검색하여 추가하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 검색 입력 */}
          <div className="space-y-2">
            <Label htmlFor="item-search">아이템 검색</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="item-search"
                placeholder="아이템명 또는 브랜드명으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                disabled={loading || loadingItems}
              />
            </div>
          </div>

          {/* 검색 결과 */}
          {searchQuery.trim() && (
            <div className="space-y-2">
              <Label>검색 결과</Label>
              {loadingItems ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  검색 결과가 없습니다.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-10 h-10 object-cover rounded border"
                          />
                        )}
                        <div>
                          <p className="font-medium">{item.name}</p>
                          {item.brands && (
                            <Badge variant="secondary" className="text-xs">
                              {item.brands.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleItemAdd(item.id)}
                        disabled={actionLoading === item.id}
                      >
                        {actionLoading === item.id ? (
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

      {/* 연결된 아이템들 */}
      {connectedItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              연결된 아이템 ({connectedItems.length})
            </CardTitle>
            <CardDescription>
              이 프로젝트에 사용된 가구 아이템들입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {connectedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded border"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.name}</p>
                    {item.brands && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        {item.brands.name}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleItemRemove(item.id)}
                    disabled={actionLoading === item.id}
                    className="text-red-600 hover:text-red-700"
                  >
                    {actionLoading === item.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    ) : (
                      <X className="h-4 w-4" />
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
