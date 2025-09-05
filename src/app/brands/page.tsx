'use client'

import { useState, useEffect } from 'react'
import { Page, Layout, Card, Text, Button, IndexTable, Modal } from '@shopify/polaris'
import { MainLayout } from '@/components/layout/MainLayout'
import { RequireAdmin } from '@/components/auth/AuthGuard'
import { BrandForm } from '@/components/brands/BrandForm'
import { brandService } from '@/services/brandService'
import type { Brand } from '@/types/database'

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | undefined>()
  const [deleteConfirm, setDeleteConfirm] = useState<Brand | null>(null)

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      // 임시 테스트 데이터
      const testData = [
        {
          id: 'brand1',
          name: '모던퍼니처',
          description: '현대적인 디자인의 가구 브랜드',
          logo_url: 'https://via.placeholder.com/100x100/4A90E2/FFFFFF?text=M',
          cover_image_url: 'https://via.placeholder.com/400x200/4A90E2/FFFFFF?text=Modern+Furniture',
          website_url: 'https://modern-furniture.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'brand2',
          name: '컴포트체어',
          description: '편안함을 최우선으로 하는 의자 전문 브랜드',
          logo_url: 'https://via.placeholder.com/100x100/E94B3C/FFFFFF?text=C',
          cover_image_url: 'https://via.placeholder.com/400x200/E94B3C/FFFFFF?text=Comfort+Chair',
          website_url: 'https://comfort-chair.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'brand3',
          name: '에코데스크',
          description: '친환경 소재를 사용하는 책상 전문 브랜드',
          logo_url: 'https://via.placeholder.com/100x100/50C878/FFFFFF?text=E',
          cover_image_url: 'https://via.placeholder.com/400x200/50C878/FFFFFF?text=Eco+Desk',
          website_url: 'https://eco-desk.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
      setBrands(testData)
    } catch (error) {
      console.error('Failed to fetch brands:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingBrand(undefined)
    setShowForm(true)
  }

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand)
    setShowForm(true)
  }

  const handleDelete = (brand: Brand) => {
    setDeleteConfirm(brand)
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return

    try {
      await brandService.deleteBrand(deleteConfirm.id)
      await fetchBrands()
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Failed to delete brand:', error)
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    fetchBrands()
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingBrand(undefined)
  }

  const rowMarkup = brands.map((brand, index) => (
    <IndexTable.Row id={brand.id} key={brand.id} position={index}>
      <IndexTable.Cell>
        {brand.cover_image_url ? (
          <div className="flex items-center justify-center">
            <div
              className="w-12 h-12 rounded-full border-2 border-gray-200 overflow-hidden bg-gray-100"
              style={{
                backgroundImage: `url(${brand.cover_image_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
              <Text variant="bodySm" as="span">
                {brand.name.charAt(0)}
              </Text>
            </div>
          </div>
        )}
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text variant="bodyMd" as="span">
          {brand.name}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text variant="bodyMd" as="span">
          {brand.description || '설명 없음'}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <div className="flex gap-2">
          {brand.website_url && (
            <Button size="slim" variant="secondary" onClick={() => window.open(brand.website_url!, '_blank')}>
              웹사이트
            </Button>
          )}
        </div>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text variant="bodySm" as="span">
          {new Date(brand.created_at).toLocaleDateString('ko-KR')}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <div className="flex gap-2">
          <Button size="slim" onClick={() => handleEdit(brand)}>
            수정
          </Button>
          <Button size="slim" destructive onClick={() => handleDelete(brand)}>
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
        title="브랜드 관리"
        primaryAction={
          <Button primary onClick={handleCreate}>
            새 브랜드
          </Button>
        }
      >
        <Layout>
          <Layout.Section>
            <Card>
              {loading ? (
                <div className="p-8 text-center">
                  <Text variant="bodyMd">로딩 중...</Text>
                </div>
              ) : (
                <IndexTable
                  resourceName={{
                    singular: '브랜드',
                    plural: '브랜드들',
                  }}
                  itemCount={brands.length}
                  headings={[
                    { title: '로고' },
                    { title: '브랜드명' },
                    { title: '설명' },
                    { title: '링크' },
                    { title: '생성일' },
                    { title: '작업' },
                  ]}
                  selectable={false}
                  emptyState={
                    <div className="p-8 text-center">
                      <Text variant="bodyMd" color="subdued">
                        아직 등록된 브랜드가 없습니다.
                      </Text>
                      <div className="mt-4">
                        <Button primary onClick={handleCreate}>
                          첫 브랜드 만들기
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

        {/* 브랜드 생성/수정 모달 */}
        <Modal
          open={showForm}
          onClose={handleFormCancel}
          title={editingBrand ? '브랜드 수정' : '새 브랜드'}
          primaryAction={{
            content: editingBrand ? '수정하기' : '생성하기',
            onAction: () => {
              // 폼 제출은 BrandForm 컴포넌트에서 처리
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
            <BrandForm
              brand={editingBrand}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </Modal.Section>
        </Modal>

        {/* 삭제 확인 모달 */}
        <Modal
          open={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="브랜드 삭제"
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
              정말로 "{deleteConfirm?.name}" 브랜드를 삭제하시겠습니까?
              이 작업은 되돌릴 수 없습니다.
            </Text>
          </Modal.Section>
        </Modal>
        </Page>
      </MainLayout>
    </RequireAdmin>
  )
}
