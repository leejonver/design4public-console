'use client'

import { useState, useEffect } from 'react'
import { Page, Layout, Card, Text, Button, IndexTable, Badge, Modal, Select, TextField, Banner } from '@shopify/polaris'
import { MainLayout } from '@/components/layout/MainLayout'
import { RequireMaster } from '@/components/auth/AuthGuard'
import { userService } from '@/services/userService'
import type { Profile } from '@/types/database'

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Profile | null>(null)
  const [editingUser, setEditingUser] = useState<Profile | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      console.log('Starting to fetch users...');
      // 실제 Supabase API 호출 시도
      const data = await userService.getUsers();
      console.log('Users fetched from API:', data);
      setUsers(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      // API 호출 실패 시 임시 테스트 데이터 사용
      console.log('Falling back to test data...');
      const testData = [
        {
          id: 'user1',
          email: 'pending@example.com',
          name: '승인대기사용자',
          role: 'general' as const,
          status: 'pending' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'user2',
          email: 'approved@example.com',
          name: '승인된사용자',
          role: 'general' as const,
          status: 'approved' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'user3',
          email: 'admin@example.com',
          name: '관리자',
          role: 'admin' as const,
          status: 'approved' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'user4',
          email: 'master@example.com',
          name: '마스터관리자',
          role: 'master' as const,
          status: 'approved' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
      setUsers(testData)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      setError('사용자 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user: Profile) => {
    setEditingUser(user)
    setShowEditModal(true)
  }

  const handleDelete = (user: Profile) => {
    setDeleteConfirm(user)
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return

    try {
      await userService.deleteUser(deleteConfirm.id)
      await fetchUsers()
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Failed to delete user:', error)
      setError('사용자 삭제에 실패했습니다.')
    }
  }

  const handleSaveUser = async () => {
    if (!editingUser) return

    try {
      await userService.updateUserName(editingUser.id, editingUser.name || '')
      await userService.updateUserRole(editingUser.id, editingUser.role)
      await fetchUsers()
      setShowEditModal(false)
      setEditingUser(null)
    } catch (error) {
      console.error('Failed to update user:', error)
      setError('사용자 정보 수정에 실패했습니다.')
    }
  }

  const handleApproveUser = async (userId: string) => {
    try {
      await userService.updateUserStatus(userId, 'approved')
      await fetchUsers()
    } catch (error) {
      console.error('Failed to approve user:', error)
      setError('사용자 승인에 실패했습니다.')
    }
  }

  const handleRejectUser = async (userId: string) => {
    try {
      await userService.updateUserStatus(userId, 'rejected')
      await fetchUsers()
    } catch (error) {
      console.error('Failed to reject user:', error)
      setError('사용자 거부에 실패했습니다.')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge tone="attention">승인대기</Badge>
      case 'approved':
        return <Badge tone="success">승인됨</Badge>
      case 'rejected':
        return <Badge tone="critical">거부됨</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'master':
        return <Badge tone="critical">마스터</Badge>
      case 'admin':
        return <Badge tone="warning">관리자</Badge>
      case 'general':
        return <Badge tone="info">일반</Badge>
      default:
        return <Badge>{role}</Badge>
    }
  }

  const roleOptions = [
    { label: '일반', value: 'general' },
    { label: '관리자', value: 'admin' },
    { label: '마스터', value: 'master' }
  ]

  const rowMarkup = users.map((user, index) => (
    <IndexTable.Row id={user.id} key={user.id} position={index}>
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="bold">
          {user.name || '이름 없음'}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text variant="bodyMd">
          {user.email}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        {getRoleBadge(user.role)}
      </IndexTable.Cell>
      <IndexTable.Cell>
        {getStatusBadge(user.status)}
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text variant="bodySm" color="subdued">
          {new Date(user.created_at).toLocaleDateString('ko-KR')}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <div className="flex gap-2">
          {user.status === 'pending' && (
            <>
              <Button size="slim" variant="primary" onClick={() => handleApproveUser(user.id)}>
                승인
              </Button>
              <Button size="slim" variant="primary" tone="critical" onClick={() => handleRejectUser(user.id)}>
                거부
              </Button>
            </>
          )}
          <Button size="slim" onClick={() => handleEdit(user)}>
            수정
          </Button>
          <Button size="slim" destructive onClick={() => handleDelete(user)}>
            삭제
          </Button>
        </div>
      </IndexTable.Cell>
    </IndexTable.Row>
  ))

  return (
    <RequireMaster>
      <MainLayout>
        <Page title="사용자 관리">
        <Layout>
          <Layout.Section>
            <Card>
              {error && (
                <div className="p-4">
                  <Banner status="critical">
                    {error}
                  </Banner>
                </div>
              )}

              {loading ? (
                <div className="p-8 text-center">
                  <Text variant="bodyMd">로딩 중...</Text>
                </div>
              ) : (
                <IndexTable
                  resourceName={{
                    singular: '사용자',
                    plural: '사용자들',
                  }}
                  itemCount={users.length}
                  headings={[
                    { title: '이름' },
                    { title: '이메일' },
                    { title: '역할' },
                    { title: '상태' },
                    { title: '가입일' },
                    { title: '작업' },
                  ]}
                  selectable={false}
                  emptyState={
                    <div className="p-8 text-center">
                      <Text variant="bodyMd" color="subdued">
                        등록된 사용자가 없습니다.
                      </Text>
                    </div>
                  }
                >
                  {rowMarkup}
                </IndexTable>
              )}
            </Card>
          </Layout.Section>
        </Layout>

        {/* 사용자 수정 모달 */}
        <Modal
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setEditingUser(null)
          }}
          title="사용자 정보 수정"
          primaryAction={{
            content: '저장하기',
            onAction: handleSaveUser
          }}
          secondaryActions={[
            {
              content: '취소',
              onAction: () => {
                setShowEditModal(false)
                setEditingUser(null)
              }
            }
          ]}
        >
          <Modal.Section>
            {editingUser && (
              <div className="space-y-4">
                <TextField
                  label="이름"
                  value={editingUser.name || ''}
                  onChange={(value) => setEditingUser({ ...editingUser, name: value })}
                  placeholder="사용자 이름을 입력하세요"
                />

                <TextField
                  label="이메일"
                  value={editingUser.email}
                  disabled
                  helpText="이메일은 수정할 수 없습니다."
                />

                <Select
                  label="역할"
                  options={roleOptions}
                  value={editingUser.role}
                  onChange={(value) => setEditingUser({ ...editingUser, role: value as 'master' | 'admin' | 'general' })}
                />
              </div>
            )}
          </Modal.Section>
        </Modal>

        {/* 사용자 삭제 확인 모달 */}
        <Modal
          open={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="사용자 삭제"
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
              정말로 "{deleteConfirm?.name || deleteConfirm?.email}" 사용자를 삭제하시겠습니까?
              <br />
              이 작업은 되돌릴 수 없습니다.
            </Text>
          </Modal.Section>
        </Modal>
        </Page>
      </MainLayout>
    </RequireMaster>
  )
}
