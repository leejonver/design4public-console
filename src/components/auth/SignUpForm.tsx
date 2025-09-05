'use client'

import { useState } from 'react'
import { Card, FormLayout, TextField, Button, Banner, Text, Checkbox } from '@shopify/polaris'
import { useAuth } from '@/lib/auth-context'

interface SignUpFormProps {
  onSwitchToLogin: () => void
}

export function SignUpForm({ onSwitchToLogin }: SignUpFormProps) {
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // 유효성 검사
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.')
      setLoading(false)
      return
    }

    if (!acceptTerms) {
      setError('이용약관에 동의해주세요.')
      setLoading(false)
      return
    }

    try {
      const { error } = await signUp(email, password)
      if (error) {
        if (error.message.includes('User already registered')) {
          setError('이미 등록된 이메일입니다.')
        } else {
          setError(error.message)
        }
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('회원가입 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card>
        <div className="p-6 text-center">
          <div className="mb-4">
            <Text variant="headingLg" as="h1">
              회원가입 완료
            </Text>
          </div>

          <Banner status="success">
            <Text variant="bodyMd">
              이메일 인증 메일이 발송되었습니다. 이메일을 확인하고 인증을 완료해주세요.
            </Text>
          </Banner>

          <div className="mt-6">
            <Text variant="bodySm" color="subdued">
              이메일 인증 후 관리자의 승인을 기다려주세요.
            </Text>
          </div>

          <div className="mt-6">
            <Button
              onClick={onSwitchToLogin}
            >
              로그인 페이지로 이동
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="p-6">
        <div className="text-center mb-6">
          <Text variant="headingLg" as="h1">
            회원가입
          </Text>
          <div className="mt-2">
            <Text variant="bodyMd" color="subdued">
              Design4Public 콘텐츠 관리 시스템
            </Text>
          </div>
        </div>

        {error && (
          <div className="mb-4">
            <Banner status="critical">
              {error}
            </Banner>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <FormLayout>
            <TextField
              type="email"
              label="이메일"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              required
              helpText="이메일 인증이 필요합니다"
            />

            <TextField
              type="password"
              label="비밀번호"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
              required
              helpText="최소 6자 이상"
            />

            <TextField
              type="password"
              label="비밀번호 확인"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
              required
            />

            <Checkbox
              label="이용약관 및 개인정보 처리방침에 동의합니다"
              checked={acceptTerms}
              onChange={setAcceptTerms}
            />

            <Button
              primary
              fullWidth
              submit
              loading={loading}
              disabled={!acceptTerms}
            >
              회원가입
            </Button>
          </FormLayout>
        </form>

        <div className="mt-6 text-center">
          <Text variant="bodySm" color="subdued">
            이미 계정이 있으신가요?{' '}
            <Button
              plain
              onClick={onSwitchToLogin}
            >
              로그인
            </Button>
          </Text>
        </div>
      </div>
    </Card>
  )
}
