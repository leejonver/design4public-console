import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const polarisCardVariants = cva(
  [
    // Base styles
    'bg-white',
    'rounded-lg',
    'shadow-sm',
    'border border-gray-200',
    'transition-shadow duration-200',
    'hover:shadow-md',
  ],
  {
    variants: {
      padding: {
        none: 'p-0',
        sm: 'p-4',
        base: 'p-6',
        lg: 'p-8',
      },
      hover: {
        true: 'hover:shadow-lg hover:border-gray-300',
        false: 'hover:shadow-sm',
      },
      border: {
        true: 'border-gray-200',
        false: 'border-transparent shadow-none',
      },
    },
    defaultVariants: {
      padding: 'base',
      hover: true,
      border: true,
    },
  }
)

export interface PolarisCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof polarisCardVariants> {}

const PolarisCard = forwardRef<HTMLDivElement, PolarisCardProps>(
  ({ className, padding, hover, border, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(polarisCardVariants({ padding, hover, border, className }))}
        {...props}
      />
    )
  }
)

PolarisCard.displayName = 'PolarisCard'

// Card 컴포넌트의 서브 컴포넌트들
interface PolarisCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}

const PolarisCardHeader = forwardRef<HTMLDivElement, PolarisCardHeaderProps>(
  ({ className, title, subtitle, actions, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-between pb-4', className)}
        {...props}
      >
        <div className="flex-1">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
          {children}
        </div>
        {actions && (
          <div className="flex items-center space-x-2 ml-4">
            {actions}
          </div>
        )}
      </div>
    )
  }
)

PolarisCardHeader.displayName = 'PolarisCardHeader'

interface PolarisCardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const PolarisCardContent = forwardRef<HTMLDivElement, PolarisCardContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('', className)}
        {...props}
      />
    )
  }
)

PolarisCardContent.displayName = 'PolarisCardContent'

interface PolarisCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const PolarisCardFooter = forwardRef<HTMLDivElement, PolarisCardFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-between pt-4 border-t border-gray-200', className)}
        {...props}
      />
    )
  }
)

PolarisCardFooter.displayName = 'PolarisCardFooter'

export {
  PolarisCard,
  PolarisCardHeader,
  PolarisCardContent,
  PolarisCardFooter,
  polarisCardVariants
}
