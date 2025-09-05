'use client'

import { useState } from 'react'
import { Card, FormLayout, TextField, Button, Banner, Text } from '@shopify/polaris'
import { useAuth } from '@/lib/auth-context'

interface LoginFormProps {
  onSwitchToSignUp: () => void
  onSwitchToReset: () => void
}

export function LoginForm({ onSwitchToSignUp, onSwitchToReset }: LoginFormProps) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await signIn(email, password)
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('이메일 또는 비밀번호가 올바르지 않습니다.')
        } else if (error.message.includes('Email not confirmed')) {
          setError('이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.')
        } else {
          setError(error.message)
        }
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <div className="p-6">
        <div className="text-center mb-6">
          <Text variant="headingLg" as="h1">
            로그인
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
            />

            <TextField
              type="password"
              label="비밀번호"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
              required
            />

            <div className="flex justify-between items-center">
              <Button
                plain
                onClick={onSwitchToReset}
              >
                비밀번호를 잊으셨나요?
              </Button>
            </div>

            <Button
              primary
              fullWidth
              submit
              loading={loading}
            >
              로그인
            </Button>
          </FormLayout>
        </form>

        <div className="mt-6 text-center">
          <Text variant="bodySm" color="subdued">
            계정이 없으신가요?{' '}
            <Button
              plain
              onClick={onSwitchToSignUp}
            >
              회원가입
            </Button>
          </Text>
        </div>
      </div>
    </Card>
  )
}
