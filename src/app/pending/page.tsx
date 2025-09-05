'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Page, Layout, Card, Text, Button, Banner } from '@shopify/polaris'
import { useAuth, useRequireAuth } from '@/lib/auth-context'

function PendingContent() {
  const { profile, signOut } = useAuth()
  const { isAuthenticated, isApproved } = useRequireAuth()
  const router = useRouter()

  // 승인된 경우 대시보드로 리다이렉트
  useEffect(() => {
    if (isAuthenticated && isApproved) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isApproved, router])

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <Page title="계정 승인 대기 중">
      <Layout>
        <Layout.Section>
          <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md">
              <Card>
                <div className="p-8 text-center">
                  <div className="mb-6">
                    <Text variant="headingLg" as="h1">
                      계정 승인 대기 중
                    </Text>
                  </div>

                  <Banner tone="warning">
                    <Text variant="bodyMd" as="span">
                      이메일 인증이 완료되었습니다. 관리자의 승인을 기다려주세요.
                    </Text>
                  </Banner>

                  <div className="mt-6 space-y-4">
                    <div>
                      <Text variant="bodySm" as="span">이메일</Text>
                      <div>
                        <Text variant="bodyMd">{profile?.email}</Text>
                      </div>
                    </div>

                    <div>
                      <Text variant="bodySm" as="span">현재 상태</Text>
                      <div>
                        <Text variant="bodyMd" as="span">
                          {profile?.status}
                        </Text>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 space-y-3">
                    <Button
                      fullWidth
                      onClick={() => window.location.reload()}
                    >
                      상태 새로고침
                    </Button>

                    <Button
                      plain
                      fullWidth
                      onClick={handleSignOut}
                    >
                      다른 계정으로 로그인
                    </Button>
                  </div>

                  <div className="mt-6">
                    <Text variant="bodySm" as="span">
                      승인 완료 후 자동으로 대시보드로 이동합니다.
                    </Text>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  )
}

export default function PendingPage() {
  const { isAuthenticated, loading } = useRequireAuth()

  // 로딩 중이거나 인증되지 않은 경우 기본 처리
  if (loading || !isAuthenticated) {
    return (
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
    )
  }

  return <PendingContent />
}
