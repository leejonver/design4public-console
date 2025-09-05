'use client'

import { useState } from 'react'
import { Page, Layout } from '@shopify/polaris'
import { LoginForm } from '@/components/auth/LoginForm'
import { SignUpForm } from '@/components/auth/SignUpForm'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

type AuthMode = 'login' | 'signup' | 'reset'

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login')

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-md">
              {mode === 'login' && (
                <LoginForm
                  onSwitchToSignUp={() => setMode('signup')}
                  onSwitchToReset={() => setMode('reset')}
                />
              )}

              {mode === 'signup' && (
                <SignUpForm
                  onSwitchToLogin={() => setMode('login')}
                />
              )}

              {mode === 'reset' && (
                <ResetPasswordForm
                  onSwitchToLogin={() => setMode('login')}
                />
              )}
            </div>
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  )
}
