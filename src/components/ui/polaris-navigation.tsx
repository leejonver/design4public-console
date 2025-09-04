'use client'

import { forwardRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  FolderOpen,
  Package,
  Building,
  Tag,
  Users,
  Settings,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { useAuthorization } from '@/hooks/useAuthorization'

interface NavigationItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  permission?: string
  children?: NavigationItem[]
}

const navigationItems: NavigationItem[] = [
  {
    label: '대시보드',
    href: '/dashboard',
    icon: Home,
  },
  {
    label: '프로젝트',
    href: '/projects',
    icon: FolderOpen,
  },
  {
    label: '아이템',
    href: '/items',
    icon: Package,
  },
  {
    label: '브랜드',
    href: '/brands',
    icon: Building,
  },
  {
    label: '태그',
    href: '/tags',
    icon: Tag,
  },
  {
    label: '사용자 관리',
    href: '/users',
    icon: Users,
    permission: 'read:users',
  },
]

interface PolarisNavigationProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * 네비게이션 너비 (접힘 상태)
   */
  collapsed?: boolean

  /**
   * 로고 클릭 시 이동할 경로
   */
  logoHref?: string
}

const PolarisNavigation = forwardRef<HTMLElement, PolarisNavigationProps>(
  ({ className, collapsed = false, logoHref = '/dashboard', ...props }, ref) => {
    const pathname = usePathname()
    const { hasPermission } = useAuthorization()

    const filteredItems = navigationItems.filter(item => {
      if (!item.permission) return true
      return hasPermission(item.permission)
    })

    return (
      <nav
        ref={ref}
        className={cn(
          'bg-white border-r border-gray-200 flex flex-col',
          collapsed ? 'w-16' : 'w-64',
          'transition-all duration-300 ease-in-out',
          className
        )}
        {...props}
      >
        {/* Logo */}
        <div className={cn(
          'flex items-center h-16 px-4 border-b border-gray-200',
          collapsed ? 'justify-center' : 'justify-start'
        )}>
          <Link
            href={logoHref}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-teal-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">D4P</span>
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">Design4Public</span>
                <span className="text-xs text-gray-600">Console</span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-4">
          <ul className="space-y-1 px-3">
            {filteredItems.map((item) => (
              <NavigationItem
                key={item.href}
                item={item}
                pathname={pathname}
                collapsed={collapsed}
                level={0}
              />
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className={cn(
            'flex items-center',
            collapsed ? 'justify-center' : 'justify-between'
          )}>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 truncate">
                  Design4Public CMS
                </p>
                <p className="text-xs text-gray-500 truncate">
                  v1.0.0
                </p>
              </div>
            )}
            <button
              className={cn(
                'p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100',
                'transition-colors duration-200'
              )}
              title={collapsed ? '메뉴 펼치기' : '메뉴 접기'}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>
    )
  }
)

PolarisNavigation.displayName = 'PolarisNavigation'

interface NavigationItemProps {
  item: NavigationItem
  pathname: string
  collapsed: boolean
  level: number
}

function NavigationItem({ item, pathname, collapsed, level }: NavigationItemProps) {
  const Icon = item.icon
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
  const hasChildren = item.children && item.children.length > 0

  if (collapsed && level === 0) {
    return (
      <li>
        <Link
          href={item.href}
          className={cn(
            'flex items-center justify-center w-10 h-10 mx-auto rounded-md',
            'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
            'transition-colors duration-200',
            isActive && 'bg-teal-50 text-teal-700'
          )}
          title={item.label}
        >
          <Icon className="w-5 h-5" />
        </Link>
      </li>
    )
  }

  return (
    <li>
      <Link
        href={item.href}
        className={cn(
          'flex items-center px-3 py-2 rounded-md text-sm font-medium',
          'transition-colors duration-200',
          isActive
            ? 'bg-teal-50 text-teal-700 border-r-2 border-teal-600'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
          level > 0 && 'ml-6'
        )}
      >
        <Icon className={cn(
          'w-5 h-5',
          collapsed ? '' : 'mr-3'
        )} />
        {!collapsed && (
          <>
            <span className="flex-1">{item.label}</span>
            {hasChildren && (
              <ChevronRight className="w-4 h-4 ml-2" />
            )}
          </>
        )}
      </Link>

      {/* 자식 아이템들 (향후 확장용) */}
      {hasChildren && !collapsed && (
        <ul className="mt-1 space-y-1">
          {item.children!.map((child) => (
            <NavigationItem
              key={child.href}
              item={child}
              pathname={pathname}
              collapsed={collapsed}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

export { PolarisNavigation }
