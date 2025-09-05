'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Navigation, Badge, Text } from '@shopify/polaris'
import { supabase } from '@/lib/supabase'
import { useRequireAuth } from '@/lib/auth-context'

interface MenuCounts {
  projects: number
  items: number
  brands: number
  tags: number
  users: number
}

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { isMaster } = useRequireAuth()
  const [counts, setCounts] = useState<MenuCounts>({
    projects: 0,
    items: 0,
    brands: 0,
    tags: 0,
    users: 0
  })
  const [loading, setLoading] = useState(true)

  // 각 메뉴의 데이터 개수를 가져오는 함수
  const fetchCounts = async () => {
    try {
      const [
        { count: projectsCount },
        { count: itemsCount },
        { count: brandsCount },
        { count: tagsCount },
        { count: usersCount }
      ] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('items').select('*', { count: 'exact', head: true }),
        supabase.from('brands').select('*', { count: 'exact', head: true }),
        supabase.from('tags').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
      ])

      setCounts({
        projects: projectsCount || 0,
        items: itemsCount || 0,
        brands: brandsCount || 0,
        tags: tagsCount || 0,
        users: usersCount || 0
      })
    } catch (error) {
      console.error('Failed to fetch counts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCounts()
  }, [])

  const navigationItems = [
    {
      label: (
        <div className="flex items-center gap-2">
          <Text variant="bodyMd">프로젝트</Text>
          {!loading && <Badge tone="info">{counts.projects}</Badge>}
        </div>
      ),
      url: '/projects',
      selected: pathname === '/projects',
      onClick: () => router.push('/projects')
    },
    {
      label: (
        <div className="flex items-center gap-2">
          <Text variant="bodyMd">아이템</Text>
          {!loading && <Badge tone="info">{counts.items}</Badge>}
        </div>
      ),
      url: '/items',
      selected: pathname === '/items',
      onClick: () => router.push('/items')
    },
    {
      label: (
        <div className="flex items-center gap-2">
          <Text variant="bodyMd">브랜드</Text>
          {!loading && <Badge tone="info">{counts.brands}</Badge>}
        </div>
      ),
      url: '/brands',
      selected: pathname === '/brands',
      onClick: () => router.push('/brands')
    },
    {
      label: (
        <div className="flex items-center gap-2">
          <Text variant="bodyMd">태그</Text>
          {!loading && <Badge tone="info">{counts.tags}</Badge>}
        </div>
      ),
      url: '/tags',
      selected: pathname === '/tags',
      onClick: () => router.push('/tags')
    },
    // 마스터 권한이 있는 경우에만 사용자 메뉴 표시
    ...(isMaster ? [{
      label: (
        <div className="flex items-center gap-2">
          <Text variant="bodyMd">사용자</Text>
          {!loading && <Badge tone="info">{counts.users}</Badge>}
        </div>
      ),
      url: '/users',
      selected: pathname === '/users',
      onClick: () => router.push('/users')
    }] : []),
    // 개발용 이미지 테스트 메뉴
    {
      label: (
        <div className="flex items-center gap-2">
          <Text variant="bodyMd">이미지 테스트</Text>
        </div>
      ),
      url: '/image-test',
      selected: pathname === '/image-test',
      onClick: () => router.push('/image-test')
    }
  ]

  return (
    <Navigation location="/">
      <Navigation.Section
        title="design4public 콘텐츠관리자"
        items={navigationItems}
      />
    </Navigation>
  )
}
