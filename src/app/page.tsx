'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // context.md에 따라 로그인 후 바로 프로젝트 목록으로 이동
    router.replace('/projects')
  }, [router])

  return null
}