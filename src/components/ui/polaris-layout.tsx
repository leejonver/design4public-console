import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface PolarisPageProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * 페이지 제목
   */
  title?: string

  /**
   * 페이지 부제목
   */
  subtitle?: string

  /**
   * 페이지 액션들 (버튼 등)
   */
  actions?: React.ReactNode

  /**
   * 좁은 너비로 제한할지 여부
   */
  narrowWidth?: boolean
}

const PolarisPage = forwardRef<HTMLDivElement, PolarisPageProps>(
  ({ className, title, subtitle, actions, narrowWidth = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'min-h-screen bg-gray-50',
          narrowWidth ? 'max-w-7xl mx-auto' : '',
          className
        )}
        {...props}
      >
        {/* Page Header */}
        {(title || subtitle || actions) && (
          <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  {title && (
                    <h1 className="text-2xl font-bold text-gray-900 truncate">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-sm text-gray-600 mt-1">
                      {subtitle}
                    </p>
                  )}
                </div>
                {actions && (
                  <div className="flex items-center space-x-3 ml-4">
                    {actions}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </div>
    )
  }
)

PolarisPage.displayName = 'PolarisPage'

interface PolarisPageSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
}

const PolarisPageSection = forwardRef<HTMLDivElement, PolarisPageSectionProps>(
  ({ className, title, subtitle, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('mb-8', className)}
        {...props}
      >
        {(title || subtitle) && (
          <div className="mb-6">
            {title && (
              <h2 className="text-lg font-semibold text-gray-900">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    )
  }
)

PolarisPageSection.displayName = 'PolarisPageSection'

// Grid 레이아웃 컴포넌트
interface PolarisGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4 | 5 | 6
  gap?: 'tight' | 'loose' | 'extraLoose'
}

const PolarisGrid = forwardRef<HTMLDivElement, PolarisGridProps>(
  ({ className, columns = 1, gap = 'loose', children, ...props }, ref) => {
    const gridCols = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
      6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
    }

    const gridGaps = {
      tight: 'gap-4',
      loose: 'gap-6',
      extraLoose: 'gap-8',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          gridCols[columns],
          gridGaps[gap],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

PolarisGrid.displayName = 'PolarisGrid'

// Stack 레이아웃 컴포넌트
interface PolarisStackProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: 'tight' | 'loose' | 'extraLoose'
  alignment?: 'leading' | 'center' | 'trailing'
}

const PolarisStack = forwardRef<HTMLDivElement, PolarisStackProps>(
  ({ className, spacing = 'loose', alignment = 'leading', children, ...props }, ref) => {
    const spacings = {
      tight: 'space-y-2',
      loose: 'space-y-4',
      extraLoose: 'space-y-6',
    }

    const alignments = {
      leading: 'items-start',
      center: 'items-center',
      trailing: 'items-end',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col',
          spacings[spacing],
          alignments[alignment],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

PolarisStack.displayName = 'PolarisStack'

// Inline 레이아웃 컴포넌트
interface PolarisInlineProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: 'tight' | 'loose' | 'extraLoose'
  alignment?: 'leading' | 'center' | 'trailing'
  wrap?: boolean
}

const PolarisInline = forwardRef<HTMLDivElement, PolarisInlineProps>(
  ({ className, spacing = 'loose', alignment = 'leading', wrap = true, children, ...props }, ref) => {
    const spacings = {
      tight: 'gap-2',
      loose: 'gap-4',
      extraLoose: 'gap-6',
    }

    const alignments = {
      leading: 'justify-start',
      center: 'justify-center',
      trailing: 'justify-end',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          spacings[spacing],
          alignments[alignment],
          wrap ? 'flex-wrap' : 'flex-nowrap',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

PolarisInline.displayName = 'PolarisInline'

export {
  PolarisPage,
  PolarisPageSection,
  PolarisGrid,
  PolarisStack,
  PolarisInline,
}
