'use client'

import { useState, useEffect } from 'react'
import { Page, Layout, Card, Text, Button, IndexTable, Badge, Modal, Thumbnail } from '@shopify/polaris'
import { MainLayout } from '@/components/layout/MainLayout'
import { RequireAdmin } from '@/components/auth/AuthGuard'
import { useRequireAuth } from '@/lib/auth-context'
import { ProjectForm } from '@/components/projects/ProjectForm'
import { projectService } from '@/services/projectService'
import type { Project } from '@/types/database'

export default function ProjectsPage() {
  const { isMaster, isAdmin } = useRequireAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | undefined>()
  const [deleteConfirm, setDeleteConfirm] = useState<Project | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      console.log('Starting to fetch projects...');

      // 실제 Supabase API 호출 시도
      const data = await projectService.getProjects();
      console.log('Projects fetched from API:', data);

      setProjects(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch projects:', error);

      // API 호출 실패 시 임시 테스트 데이터 사용
      console.log('Falling back to test data...');
      const testData = [
        {
          id: '1',
          title: '테스트 프로젝트 1',
          description: 'Playwright를 사용한 기능 테스트용 프로젝트입니다.',
          status: 'draft',
          year: 2024,
          area: 150.5,
          created_at: new Date().toISOString(),
          cover_image_url: 'https://via.placeholder.com/100x100?text=Cover1',
          project_tags: [
            {
              tag_id: 'tag1',
              tags: { name: '현대적' }
            },
            {
              tag_id: 'tag4',
              tags: { name: '인체공학적' }
            }
          ],
          project_items: [
            {
              item_id: 'item1',
              items: {
                id: 'item1',
                name: '사무용 책상',
                description: '편안한 작업을 위한 사무용 책상'
              }
            },
            {
              item_id: 'item2',
              items: {
                id: 'item2',
                name: '사무용 의자',
                description: '인체공학적 디자인의 사무용 의자'
              }
            }
          ]
        },
        {
          id: '2',
          title: '테스트 프로젝트 2',
          description: '두 번째 테스트 프로젝트',
          status: 'published',
          year: 2023,
          area: 200.0,
          created_at: new Date().toISOString(),
          cover_image_url: 'https://via.placeholder.com/100x100?text=Cover2',
          project_tags: [
            {
              tag_id: 'tag2',
              tags: { name: '클래식' }
            }
          ],
          project_items: [
            {
              item_id: 'item3',
              items: {
                id: 'item3',
                name: '책상용 조명',
                description: '눈부심 방지 LED 조명'
              }
            }
          ]
        }
      ]
      setProjects(testData);
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingProject(undefined)
    setShowForm(true)
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setShowForm(true)
  }

  const handleDelete = (project: Project) => {
    setDeleteConfirm(project)
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return

    try {
      await projectService.deleteProject(deleteConfirm.id)
      await fetchProjects()
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Failed to delete project:', error)
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    fetchProjects()
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingProject(undefined)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge tone="info">초안</Badge>
      case 'published':
        return <Badge tone="success">게시됨</Badge>
      case 'hidden':
        return <Badge tone="critical">숨김</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const rowMarkup = projects.map((project, index) => (
    <IndexTable.Row id={project.id} key={project.id} position={index}>
      <IndexTable.Cell>
        <div className="flex items-center gap-3">
          {project.cover_image_url && (
            <Thumbnail
              source={project.cover_image_url}
              alt={project.title}
              size="small"
            />
          )}
          <Text variant="bodyMd" fontWeight="bold">
            {project.title}
          </Text>
        </div>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text variant="bodyMd" color="subdued">
          {project.description || '설명 없음'}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <div className="flex flex-wrap gap-1">
          {(project as any).project_tags?.map((pt: any) => (
            <div key={pt.tag_id} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
              {pt.tags?.name || '알 수 없음'}
            </div>
          )) || '태그 없음'}
        </div>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <div className="flex flex-wrap gap-1">
          {(project as any).project_items?.map((pi: any) => (
            <div key={pi.item_id} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
              {pi.items?.name || '알 수 없음'}
            </div>
          )) || '아이템 없음'}
        </div>
      </IndexTable.Cell>
      <IndexTable.Cell>
        {getStatusBadge(project.status)}
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text variant="bodyMd">
          {project.year ? `${project.year}년` : '-'}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text variant="bodyMd">
          {project.area ? `${project.area}㎡` : '-'}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text variant="bodySm" color="subdued">
          {new Date(project.created_at).toLocaleDateString('ko-KR')}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <div className="flex gap-2">
          {(isMaster || isAdmin) && (
            <Button size="slim" onClick={() => handleEdit(project)}>
              수정
            </Button>
          )}
          {isMaster && (
            <Button size="slim" destructive onClick={() => handleDelete(project)}>
              삭제
            </Button>
          )}
        </div>
      </IndexTable.Cell>
    </IndexTable.Row>
  ))

  return (
    <RequireAdmin>
      <MainLayout>
      <Page
        title="프로젝트 관리"
        primaryAction={
          (isMaster || isAdmin) && (
            <Button variant="primary" onClick={handleCreate}>
              새 프로젝트
            </Button>
          )
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
                    singular: '프로젝트',
                    plural: '프로젝트들',
                  }}
                  itemCount={projects.length}
                  headings={[
                    { title: '프로젝트' },
                    { title: '설명' },
                    { title: '태그' },
                    { title: '아이템' },
                    { title: '상태' },
                    { title: '연도' },
                    { title: '면적' },
                    { title: '생성일' },
                    { title: '작업' },
                  ]}
                  selectable={false}
                  emptyState={
                    <div className="p-8 text-center">
                      <Text variant="bodyMd" color="subdued">
                        아직 등록된 프로젝트가 없습니다.
                      </Text>
                      <div className="mt-4">
                        <Button variant="primary" onClick={handleCreate}>
                          첫 프로젝트 만들기
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

        {/* 프로젝트 생성/수정 모달 */}
        <Modal
          open={showForm}
          onClose={handleFormCancel}
          title={editingProject ? '프로젝트 수정' : '새 프로젝트'}
          primaryAction={{
            content: editingProject ? '수정하기' : '생성하기',
            onAction: () => {
              // 폼 제출은 ProjectForm 컴포넌트에서 처리
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
            <ProjectForm
              project={editingProject}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </Modal.Section>
        </Modal>

        {/* 삭제 확인 모달 */}
        <Modal
          open={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="프로젝트 삭제"
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
              정말로 "{deleteConfirm?.title}" 프로젝트를 삭제하시겠습니까?
              이 작업은 되돌릴 수 없습니다.
            </Text>
          </Modal.Section>
        </Modal>
        </Page>
      </MainLayout>
    </RequireAdmin>
  )
}
