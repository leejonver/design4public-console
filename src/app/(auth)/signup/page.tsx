'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

const signupSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword']
})

type SignupForm = z.infer<typeof signupSchema>

export default function SignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema)
  })

  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      })

      if (error) {
        throw error
      }

      setSuccess(true)
    } catch (error: any) {
      setError(error.message || '회원가입 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900">회원가입 완료</h2>
          <p className="mt-2 text-sm text-slate-600">
            이메일 인증 후 관리자 승인이 필요합니다
          </p>
        </div>

        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            <strong>{register.email}</strong>로 인증 이메일을 보냈습니다.
            이메일을 확인하고 링크를 클릭하여 계정을 활성화해주세요.
            <br />
            <br />
            인증 완료 후 관리자의 승인을 기다려주세요.
          </AlertDescription>
        </Alert>

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            로그인 페이지로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">회원가입</h2>
        <p className="mt-2 text-sm text-slate-600">
          Design4Public 콘텐츠 관리 시스템 계정을 생성합니다
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            {...register('email')}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">비밀번호</Label>
          <Input
            id="password"
            type="password"
            placeholder="최소 8자 이상"
            {...register('password')}
            disabled={isLoading}
          />
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">비밀번호 확인</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="비밀번호를 다시 입력하세요"
            {...register('confirmPassword')}
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          회원가입
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-slate-600">
          이미 계정이 있으신가요?{' '}
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-500"
          >
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
