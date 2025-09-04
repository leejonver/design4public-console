'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, User, Mail, Shield, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuthGuard } from '@/lib/auth-context'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { getAllUsers, updateUserStatus, updateUserRole, deleteUser } from '@/services/authService'

interface UserWithProfile {
  id: string
  email: string
  profile: {
    id: string
    email: string
    role: 'master' | 'admin' | 'general'
    status: 'pending' | 'approved' | 'rejected'
    created_at: string
    updated_at: string
  }
}

export default function UsersPage() {
  const { toast } = useToast()
  const { isMaster } = useAuthGuard()
  const [users, setUsers] = useState<UserWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (isMaster) {
      loadUsers()
    }
  }, [isMaster])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await getAllUsers()
      // 프로필 정보와 함께 사용자 정보 구성
      const usersWithProfiles = data.map(profile => ({
        id: profile.id,
        email: profile.email,
        profile: {
          ...profile,
          role: profile.role as 'master' | 'admin' | 'general',
          status: profile.status as 'pending' | 'approved' | 'rejected'
        },
      }))
      setUsers(usersWithProfiles)
    } catch (error: unknown) {
      console.error('Failed to load users:', error)
      setError('사용자를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (userId: string, newStatus: 'approved' | 'rejected') => {
    try {
      setActionLoading(`${userId}-status`)
      await updateUserStatus(userId, newStatus)

      toast({
        title: '상태 변경 완료',
        description: `사용자 상태가 ${newStatus === 'approved' ? '승인됨' : '거절됨'}으로 변경되었습니다.`,
      })

      // 목록 업데이트
      setUsers(users.map(user =>
        user.id === userId
          ? { ...user, profile: { ...user.profile!, status: newStatus } }
          : user
      ))
    } catch (error: unknown) {
      console.error('Failed to update user status:', error)
      toast({
        title: '상태 변경 실패',
        description: error instanceof Error ? error.message : '사용자 상태 변경 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleRoleChange = async (userId: string, newRole: 'master' | 'admin' | 'general') => {
    try {
      setActionLoading(`${userId}-role`)
      await updateUserRole(userId, newRole)

      toast({
        title: '역할 변경 완료',
        description: `사용자 역할이 ${newRole}으로 변경되었습니다.`,
      })

      // 목록 업데이트
      setUsers(users.map(user =>
        user.id === userId
          ? { ...user, profile: { ...user.profile!, role: newRole } }
          : user
      ))
    } catch (error: unknown) {
      console.error('Failed to update user role:', error)
      toast({
        title: '역할 변경 실패',
        description: error instanceof Error ? error.message : '사용자 역할 변경 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (userId: string, userEmail: string) => {
    try {
      setActionLoading(`${userId}-delete`)
      await deleteUser(userId)

      toast({
        title: '사용자 삭제 완료',
        description: `"${userEmail}" 사용자가 삭제되었습니다.`,
      })

      // 목록에서 제거
      setUsers(users.filter(user => user.id !== userId))
    } catch (error: unknown) {
      console.error('Failed to delete user:', error)
      toast({
        title: '사용자 삭제 실패',
        description: error instanceof Error ? error.message : '사용자 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />승인됨</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">대기중</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="h-3 w-3 mr-1" />거절됨</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'master':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100"><Shield className="h-3 w-3 mr-1" />마스터</Badge>
      case 'admin':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">관리자</Badge>
      case 'general':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">일반</Badge>
      default:
        return <Badge variant="secondary">{role}</Badge>
    }
  }

  // 마스터 권한이 없으면 접근 불가
  if (!isMaster) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">사용자 관리</h1>
            <p className="text-muted-foreground">
              사용자 계정과 권한을 관리하세요.
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              접근 권한이 없습니다
            </h3>
            <p className="text-sm text-muted-foreground text-center">
              이 페이지는 마스터 권한이 있는 사용자만 접근할 수 있습니다.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>사용자를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">사용자 관리</h1>
          <p className="text-muted-foreground">
            사용자 계정과 권한을 관리하세요.
          </p>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* 사용자 목록 */}
      {users.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              등록된 사용자가 없습니다
            </h3>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {user.email}
                      </CardTitle>
                      <CardDescription>
                        가입일: {new Date(user.profile?.created_at || '').toLocaleDateString('ko-KR')}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(user.profile?.status || 'pending')}
                    {getRoleBadge(user.profile?.role || 'general')}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 상태 변경 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">계정 상태</label>
                    <Select
                      value={user.profile?.status || 'pending'}
                      onValueChange={(value) => handleStatusChange(user.id, value as 'approved' | 'rejected')}
                      disabled={actionLoading === `${user.id}-status`}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">대기중</SelectItem>
                        <SelectItem value="approved">승인</SelectItem>
                        <SelectItem value="rejected">거절</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 역할 변경 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">사용자 역할</label>
                    <Select
                      value={user.profile?.role || 'general'}
                      onValueChange={(value) => handleRoleChange(user.id, value as 'master' | 'admin' | 'general')}
                      disabled={actionLoading === `${user.id}-role`}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">일반</SelectItem>
                        <SelectItem value="admin">관리자</SelectItem>
                        <SelectItem value="master">마스터</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 삭제 버튼 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">관리</label>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full text-red-600 hover:text-red-700"
                          disabled={actionLoading === `${user.id}-delete`}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {actionLoading === `${user.id}-delete` ? '삭제 중...' : '삭제'}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>사용자 삭제</AlertDialogTitle>
                          <AlertDialogDescription>
                            정말로 "{user.email}" 사용자를 삭제하시겠습니까?
                            이 작업은 되돌릴 수 없습니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(user.id, user.email)}
                            disabled={actionLoading === `${user.id}-delete`}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {actionLoading === `${user.id}-delete` ? '삭제 중...' : '삭제'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
