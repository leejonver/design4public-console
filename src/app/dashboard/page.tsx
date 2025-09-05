'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    // context.md에 따라 별도의 대시보드 페이지는 없고
    // 로그인 후 바로 프로젝트 목록으로 이동
    router.replace('/projects')
  }, [router])

  return null
}
