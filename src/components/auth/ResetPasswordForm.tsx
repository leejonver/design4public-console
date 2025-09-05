'use client'

import { useState } from 'react'
import { Card, FormLayout, TextField, Button, Banner, Text } from '@shopify/polaris'
import { useAuth } from '@/lib/auth-context'

interface ResetPasswordFormProps {
  onSwitchToLogin: () => void
}

export function ResetPasswordForm({ onSwitchToLogin }: ResetPasswordFormProps) {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await resetPassword(email)
      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('비밀번호 재설정 요청 중 오류가 발생했습니다.')
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
              비밀번호 재설정
            </Text>
          </div>

          <Banner status="success">
            <Text variant="bodyMd">
              비밀번호 재설정 이메일이 발송되었습니다. 이메일을 확인해주세요.
            </Text>
          </Banner>

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
            비밀번호 재설정
          </Text>
          <div className="mt-2">
            <Text variant="bodyMd" color="subdued">
              등록된 이메일 주소를 입력해주세요
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
            />

            <Button
              primary
              fullWidth
              submit
              loading={loading}
            >
              비밀번호 재설정 이메일 보내기
            </Button>
          </FormLayout>
        </form>

        <div className="mt-6 text-center">
          <Button
            plain
            onClick={onSwitchToLogin}
          >
            로그인으로 돌아가기
          </Button>
        </div>
      </div>
    </Card>
  )
}
