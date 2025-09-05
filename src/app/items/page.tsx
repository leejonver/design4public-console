'use client'

import { useState, useEffect } from 'react'
import { Page, Layout, Card, Text, Button, IndexTable, Badge, Modal, Thumbnail } from '@shopify/polaris'
import { MainLayout } from '@/components/layout/MainLayout'
import { RequireAdmin } from '@/components/auth/AuthGuard'
import { ItemForm } from '@/components/items/ItemForm'
import { itemService } from '@/services/itemService'
import type { Item } from '@/types/database'

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | undefined>()
  const [deleteConfirm, setDeleteConfirm] = useState<Item | null>(null)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      // 임시 테스트 데이터
      const testData = [
        {
          id: '1',
          name: '사무용 책상',
          description: '편안한 작업을 위한 사무용 책상입니다.',
          brand_id: 'brand1',
          nara_url: 'https://www.g2b.go.kr/example1',
          image_url: 'https://via.placeholder.com/200x150?text=사무용책상',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          brands: {
            id: 'brand1',
            name: '테스트 브랜드'
          }
        },
        {
          id: '2',
          name: '사무용 의자',
          description: '인체공학적 디자인의 사무용 의자입니다.',
          brand_id: 'brand2',
          nara_url: 'https://www.g2b.go.kr/example2',
          image_url: 'https://via.placeholder.com/200x150?text=사무용의자',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          brands: {
            id: 'brand2',
            name: '모던퍼니처'
          }
        }
      ]
      setItems(testData)
    } catch (error) {
      console.error('Failed to fetch items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingItem(undefined)
    setShowForm(true)
  }

  const handleEdit = (item: Item) => {
    setEditingItem(item)
    setShowForm(true)
  }

  const handleDelete = (item: Item) => {
    setDeleteConfirm(item)
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return

    try {
      await itemService.deleteItem(deleteConfirm.id)
      await fetchItems()
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Failed to delete item:', error)
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    fetchItems()
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingItem(undefined)
  }

  const rowMarkup = items.map((item, index) => (
    <IndexTable.Row id={item.id} key={item.id} position={index}>
      <IndexTable.Cell>
        {item.image_url ? (
          <Thumbnail
            source={item.image_url}
            alt={item.name}
            size="small"
          />
        ) : (
          <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
            <Text variant="bodySm" as="span">없음</Text>
          </div>
        )}
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text variant="bodyMd" as="span" fontWeight="bold">
          {item.name}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text variant="bodyMd" as="span">
          {item.description || '설명 없음'}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text variant="bodyMd" as="span">
          {(item as any).brands?.name || '브랜드 없음'}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <div className="flex gap-2">
          {item.nara_url && (
            <Button size="slim" variant="secondary" onClick={() => window.open(item.nara_url!, '_blank')}>
              나라장터
            </Button>
          )}
          {item.image_url && (
            <Button size="slim" variant="secondary" onClick={() => window.open(item.image_url!, '_blank')}>
              이미지
            </Button>
          )}
        </div>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text variant="bodySm" as="span">
          {new Date(item.created_at).toLocaleDateString('ko-KR')}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <div className="flex gap-2">
          <Button size="slim" onClick={() => handleEdit(item)}>
            수정
          </Button>
          <Button size="slim" variant="primary" tone="critical" onClick={() => handleDelete(item)}>
            삭제
          </Button>
        </div>
      </IndexTable.Cell>
    </IndexTable.Row>
  ))

  return (
    <RequireAdmin>
      <MainLayout>
      <Page
        title="아이템 관리"
        primaryAction={
          <Button variant="primary" onClick={handleCreate}>
            새 아이템
          </Button>
        }
      >
        <Layout>
          <Layout.Section>
            <Card>
              {loading ? (
                <div className="p-8 text-center">
                  <Text variant="bodyMd" as="span">로딩 중...</Text>
                </div>
              ) : (
                <IndexTable
                  resourceName={{
                    singular: '아이템',
                    plural: '아이템들',
                  }}
                  itemCount={items.length}
                  headings={[
                    { title: '이미지' },
                    { title: '아이템명' },
                    { title: '설명' },
                    { title: '브랜드' },
                    { title: '링크' },
                    { title: '생성일' },
                    { title: '작업' },
                  ]}
                  selectable={false}
                  emptyState={
                    <div className="p-8 text-center">
                      <Text variant="bodyMd" as="span">
                        아직 등록된 아이템이 없습니다.
                      </Text>
                      <div className="mt-4">
                        <Button variant="primary" onClick={handleCreate}>
                          첫 아이템 만들기
                        </Button>
                      </div>
                    </div>
                  }
                >
                  {rowMarkup}
                </IndexTable>
              )}
            </Card>
          </Layout.Section>
        </Layout>

        {/* 아이템 생성/수정 모달 */}
        <Modal
          open={showForm}
          onClose={handleFormCancel}
          title={editingItem ? '아이템 수정' : '새 아이템'}
          primaryAction={{
            content: editingItem ? '수정하기' : '생성하기',
            onAction: () => {
              // 폼 제출은 ItemForm 컴포넌트에서 처리
            }
          }}
          secondaryActions={[
            {
              content: '취소',
              onAction: handleFormCancel
            }
          ]}
        >
          <Modal.Section>
            <ItemForm
              item={editingItem}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </Modal.Section>
        </Modal>

        {/* 삭제 확인 모달 */}
        <Modal
          open={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="아이템 삭제"
          primaryAction={{
            content: '삭제하기',
            destructive: true,
            onAction: confirmDelete
          }}
          secondaryActions={[
            {
              content: '취소',
              onAction: () => setDeleteConfirm(null)
            }
          ]}
        >
          <Modal.Section>
            <Text variant="bodyMd" as="span">
              정말로 "{deleteConfirm?.name}" 아이템을 삭제하시겠습니까?
              이 작업은 되돌릴 수 없습니다.
            </Text>
          </Modal.Section>
        </Modal>
        </Page>
      </MainLayout>
    </RequireAdmin>
  )
}
