'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Loader2, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import { useState } from 'react'
import { signIn } from '@/services/authService'

export default function HomePage() {
  const { user, loading, updateUserAfterSignIn } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loadingLogin, setLoadingLogin] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    console.log('Main page useEffect:', { loading, user: !!user, profileStatus: user?.profile?.status })

    if (!loading && user) {
      console.log('Main page: User found, redirecting to dashboard')
      // 로그인된 경우 대시보드로 리다이렉트
      try {
        router.replace('/dashboard')
        // 만약 router.replace가 작동하지 않으면 강제 리다이렉트
        setTimeout(() => {
          if (window.location.pathname === '/') {
            console.log('Router replace failed, using window.location')
            window.location.href = '/dashboard'
          }
        }, 100)
      } catch (error) {
        console.error('Router redirect failed:', error)
        window.location.href = '/dashboard'
      }
    } else if (!loading && !user) {
      console.log('Main page: No user, showing login form')
    } else if (loading) {
      console.log('Main page: Still loading...')
    }
  }, [user, loading]) // router 제거하여 불필요한 재실행 방지

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingLogin(true)
    setError('')

    try {
      await signIn({ email, password })
      // 로그인 성공 후 사용자 정보 수동 업데이트
      await updateUserAfterSignIn()
      console.log('Login successful, user info updated')
    } catch (error: unknown) {
      console.error('Login error:', error)
      setError(error instanceof Error ? error.message : '로그인에 실패했습니다.')
    } finally {
      setLoadingLogin(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (user) {
    // 로그인된 경우 잠시 로딩 표시 후 대시보드로 리다이렉트
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">대시보드로 이동 중...</p>
        </div>
      </div>
    )
  }

  // 로그인되지 않은 경우 간단한 로그인 페이지 표시
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-1">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Design4Public Console
          </CardTitle>
          <CardDescription>
            콘텐츠 관리 시스템
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>

          <CardContent className="pt-0">
            <Button
              type="submit"
              className="w-full"
              disabled={loadingLogin}
            >
              {loadingLogin ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  로그인 중...
                </>
              ) : (
                '로그인'
              )}
            </Button>
          </CardContent>
        </form>

        <CardContent className="pt-0">
          <div className="text-center text-sm">
            계정이 없으신가요?{' '}
            <Link href="/signup" className="text-primary hover:underline">
              회원가입
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
