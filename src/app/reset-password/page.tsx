'use client'

import { Suspense } from 'react'
import { Page, Layout, Card, Text } from '@shopify/polaris'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

function ResetPasswordContent() {
  return (
    <Page>
      <Layout>
        <Layout.Section>
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-md">
              <ResetPasswordForm onSwitchToLogin={() => window.location.href = '/auth'} />
            </div>
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <Page>
        <Layout>
          <Layout.Section>
            <Card>
              <div className="p-8 text-center">
                <Text variant="bodyMd">
                  로딩 중...
                </Text>
              </div>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
