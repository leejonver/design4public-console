'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { PolarisButton } from '@/components/ui/polaris-button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react'

type VerificationStatus = 'loading' | 'success' | 'error' | 'expired'

function VerifyPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<VerificationStatus>('loading')
  const [message, setMessage] = useState('')
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        // URL에서 토큰 파라미터 추출
        const token = searchParams.get('token')
        const type = searchParams.get('type')

        if (!token || type !== 'signup') {
          setStatus('error')
          setMessage('잘못된 검증 링크입니다.')
          return
        }

        // Supabase를 통해 이메일 검증 처리
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'signup'
        })

        if (error) {
          if (error.message.includes('expired')) {
            setStatus('expired')
            setMessage('검증 링크가 만료되었습니다. 새로운 링크를 요청해주세요.')
          } else {
            setStatus('error')
            setMessage('이메일 검증 중 오류가 발생했습니다.')
          }
          return
        }

        // 검증 성공 - 사용자 상태 업데이트
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          // 프로필 테이블에서 사용자 상태를 'approved'로 업데이트
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ status: 'approved' })
            .eq('id', user.id)

          if (updateError) {
            console.error('프로필 상태 업데이트 오류:', updateError)
            // 프로필 업데이트 실패해도 검증은 성공으로 처리
          }
        }

        setStatus('success')
        setMessage('이메일이 성공적으로 검증되었습니다! 관리자의 승인을 기다려주세요.')

        // 3초 후 로그인 페이지로 리다이렉트
        setTimeout(() => {
          router.push('/login')
        }, 3000)

      } catch (error: any) {
        console.error('이메일 검증 오류:', error)
        setStatus('error')
        setMessage('이메일 검증 중 오류가 발생했습니다.')
      }
    }

    handleEmailVerification()
  }, [searchParams, router])

  const handleResendVerification = async () => {
    setIsResending(true)
    try {
      // 현재 사용자 정보 가져오기
      const { data: { user } } = await supabase.auth.getUser()

      if (!user?.email) {
        setMessage('사용자 정보를 찾을 수 없습니다.')
        return
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email
      })

      if (error) {
        setMessage('인증 이메일 재전송 중 오류가 발생했습니다.')
      } else {
        setMessage('인증 이메일을 재전송했습니다. 이메일을 확인해주세요.')
      }
    } catch (error) {
      setMessage('인증 이메일 재전송 중 오류가 발생했습니다.')
    } finally {
      setIsResending(false)
    }
  }

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center space-y-4">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
            <h2 className="text-xl font-semibold text-slate-900">
              이메일 검증 중...
            </h2>
            <p className="text-sm text-slate-600">
              잠시만 기다려주세요.
            </p>
          </div>
        )

      case 'success':
        return (
          <div className="text-center space-y-4">
            <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
            <h2 className="text-xl font-semibold text-slate-900">
              이메일 검증 완료!
            </h2>
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                {message}
              </AlertDescription>
            </Alert>
            <p className="text-sm text-slate-600">
              3초 후 로그인 페이지로 이동합니다...
            </p>
          </div>
        )

      case 'expired':
        return (
          <div className="text-center space-y-4">
            <XCircle className="mx-auto h-12 w-12 text-amber-600" />
            <h2 className="text-xl font-semibold text-slate-900">
              검증 링크 만료
            </h2>
            <Alert className="border-amber-200 bg-amber-50">
              <AlertDescription className="text-amber-800">
                {message}
              </AlertDescription>
            </Alert>
            <PolarisButton
              onClick={handleResendVerification}
              disabled={isResending}
              className="w-full"
            >
              {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Mail className="mr-2 h-4 w-4" />
              새로운 인증 이메일 받기
            </PolarisButton>
          </div>
        )

      case 'error':
        return (
          <div className="text-center space-y-4">
            <XCircle className="mx-auto h-12 w-12 text-red-600" />
            <h2 className="text-xl font-semibold text-slate-900">
              검증 실패
            </h2>
            <Alert variant="destructive">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
            <div className="space-y-2">
              <PolarisButton
                onClick={handleResendVerification}
                disabled={isResending}
                variant="secondary"
                className="w-full"
              >
                {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Mail className="mr-2 h-4 w-4" />
                인증 이메일 재전송
              </PolarisButton>
              <Link href="/login">
                <PolarisButton variant="plain" className="w-full">
                  로그인 페이지로 돌아가기
                </PolarisButton>
              </Link>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">Design4Public</h1>
        <p className="mt-2 text-sm text-slate-600">콘텐츠 관리 시스템</p>
      </div>

      {renderContent()}

      {(status === 'success' || status === 'error') && (
        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-teal-600 hover:text-teal-500"
          >
            로그인 페이지로 돌아가기
          </Link>
        </div>
      )}
    </div>
  )
}

function VerifyPageFallback() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">Design4Public</h1>
        <p className="mt-2 text-sm text-slate-600">콘텐츠 관리 시스템</p>
      </div>

      <div className="text-center space-y-4">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-teal-600" />
        <h2 className="text-xl font-semibold text-slate-900">
          로딩 중...
        </h2>
        <p className="text-sm text-slate-600">
          잠시만 기다려주세요.
        </p>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<VerifyPageFallback />}>
      <VerifyPageContent />
    </Suspense>
  )
}
