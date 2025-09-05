'use client'

import { useState, useEffect } from 'react'
import { Page, Layout, Card, Text, Button, IndexTable, Badge, Modal, TextField } from '@shopify/polaris'
import { MainLayout } from '@/components/layout/MainLayout'
import { RequireAdmin } from '@/components/auth/AuthGuard'
import { TagForm } from '@/components/tags/TagForm'
import { tagService } from '@/services/tagService'
import type { Tag } from '@/types/database'

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [filteredTags, setFilteredTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | undefined>()
  const [deleteConfirm, setDeleteConfirm] = useState<Tag | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchTags()
  }, [])

  useEffect(() => {
    // 검색 필터링
    if (searchQuery.trim()) {
      const filtered = tags.filter(tag =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredTags(filtered)
    } else {
      setFilteredTags(tags)
    }
  }, [tags, searchQuery])

  const fetchTags = async () => {
    try {
      // 임시 테스트 데이터
      const testData = [
        {
          id: 'tag1',
          name: '현대적',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'tag2',
          name: '클래식',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'tag3',
          name: '미니멀',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'tag4',
          name: '인체공학적',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'tag5',
          name: '친환경',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
      setTags(testData)
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingTag(undefined)
    setShowForm(true)
  }

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag)
    setShowForm(true)
  }

  const handleDelete = (tag: Tag) => {
    setDeleteConfirm(tag)
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return

    try {
      await tagService.deleteTag(deleteConfirm.id)
      await fetchTags()
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Failed to delete tag:', error)
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingTag(undefined)
    fetchTags()
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingTag(undefined)
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
  }

  const rowMarkup = filteredTags.map((tag, index) => (
    <IndexTable.Row id={tag.id} key={tag.id} position={index}>
      <IndexTable.Cell>
        <Badge status="info">{tag.name}</Badge>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text variant="bodySm" color="subdued">
          {new Date(tag.created_at).toLocaleDateString('ko-KR')}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <div className="flex gap-2">
          <Button size="slim" onClick={() => handleEdit(tag)}>
            수정
          </Button>
          <Button size="slim" destructive onClick={() => handleDelete(tag)}>
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
        title="태그 관리"
        primaryAction={
          <Button variant="primary" onClick={handleCreate}>
            새 태그
          </Button>
        }
      >
        <Layout>
          <Layout.Section>
            <Card>
              {/* 검색 필드 */}
              <div className="p-4 border-b">
                <TextField
                  label=""
                  placeholder="태그 검색..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  clearButton
                  onClearButtonClick={() => setSearchQuery('')}
                />
              </div>

              {loading ? (
                <div className="p-8 text-center">
                  <Text variant="bodyMd">로딩 중...</Text>
                </div>
              ) : (
                <IndexTable
                  resourceName={{
                    singular: '태그',
                    plural: '태그들',
                  }}
                  itemCount={filteredTags.length}
                  headings={[
                    { title: '태그명' },
                    { title: '생성일' },
                    { title: '작업' },
                  ]}
                  selectable={false}
                  emptyState={
                    searchQuery ? (
                      <div className="p-8 text-center">
                        <Text variant="bodyMd" color="subdued">
                          "{searchQuery}"에 대한 검색 결과가 없습니다.
                        </Text>
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <Text variant="bodyMd" color="subdued">
                          아직 등록된 태그가 없습니다.
                        </Text>
                        <div className="mt-4">
                          <Button variant="primary" onClick={handleCreate}>
                            첫 태그 만들기
                          </Button>
                        </div>
                      </div>
                    )
                  }
                >
                  {rowMarkup}
                </IndexTable>
              )}
            </Card>
          </Layout.Section>
        </Layout>

        {/* 태그 생성/수정 모달 */}
        <Modal
          open={showForm}
          onClose={handleFormCancel}
          title={editingTag ? '태그 수정' : '새 태그'}
          primaryAction={{
            content: editingTag ? '수정하기' : '생성하기',
            onAction: () => {
              // 폼 제출은 TagForm 컴포넌트에서 처리
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
            <TagForm
              tag={editingTag}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </Modal.Section>
        </Modal>

        {/* 삭제 확인 모달 */}
        <Modal
          open={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="태그 삭제"
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
            <Text variant="bodyMd">
              정말로 "{deleteConfirm?.name}" 태그를 삭제하시겠습니까?
              이 작업은 되돌릴 수 없습니다.
            </Text>
          </Modal.Section>
        </Modal>
        </Page>
      </MainLayout>
    </RequireAdmin>
  )
}
