import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { designTokens } from '@/lib/design-tokens'
import { Loader2 } from 'lucide-react'

const polarisButtonVariants = cva(
  [
    // Base styles (Polaris 디자인 원칙 기반)
    'inline-flex items-center justify-center',
    'font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'active:scale-[0.98]',

    // Polaris spacing
    'px-4 py-2.5',

    // Polaris border radius
    'rounded-md',

    // Polaris typography
    'text-sm leading-5',
  ],
  {
    variants: {
      variant: {
        primary: [
          // Primary 버튼 스타일 (Polaris Teal)
          'bg-teal-600 text-white',
          'hover:bg-teal-700',
          'focus:ring-teal-500',
          'shadow-sm',
        ],
        secondary: [
          // Secondary 버튼 스타일
          'bg-white text-gray-900',
          'border border-gray-300',
          'hover:bg-gray-50',
          'focus:ring-teal-500',
          'shadow-sm',
        ],
        outline: [
          // Outline 버튼 스타일
          'bg-transparent text-teal-600',
          'border border-teal-600',
          'hover:bg-teal-50',
          'focus:ring-teal-500',
        ],
        plain: [
          // Plain 버튼 스타일 (텍스트만)
          'bg-transparent text-gray-700',
          'hover:bg-gray-100',
          'hover:text-gray-900',
          'focus:ring-gray-500',
        ],
        destructive: [
          // Destructive 버튼 스타일 (Critical)
          'bg-red-600 text-white',
          'hover:bg-red-700',
          'focus:ring-red-500',
          'shadow-sm',
        ],
        success: [
          // Success 버튼 스타일
          'bg-green-600 text-white',
          'hover:bg-green-700',
          'focus:ring-green-500',
          'shadow-sm',
        ],
      },
      size: {
        sm: [
          'px-3 py-1.5',
          'text-xs leading-4',
          'min-h-[32px]',
        ],
        base: [
          'px-4 py-2.5',
          'text-sm leading-5',
          'min-h-[40px]',
        ],
        lg: [
          'px-6 py-3.5',
          'text-base leading-6',
          'min-h-[48px]',
        ],
      },
      loading: {
        true: 'cursor-wait',
        false: '',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'base',
      loading: false,
      fullWidth: false,
    },
  }
)

export interface PolarisButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof polarisButtonVariants> {
  /**
   * 로딩 상태 표시
   */
  loading?: boolean

  /**
   * 전체 너비 사용
   */
  fullWidth?: boolean

  /**
   * 로딩 텍스트 (기본값: 로딩 중...)
   */
  loadingText?: string

  /**
   * 아이콘 (좌측에 표시)
   */
  icon?: React.ReactNode
}

const PolarisButton = forwardRef<HTMLButtonElement, PolarisButtonProps>(
  ({
    className,
    variant,
    size,
    loading,
    fullWidth,
    loadingText = '로딩 중...',
    icon,
    children,
    disabled,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading

    return (
      <button
        className={cn(
          polarisButtonVariants({ variant, size, loading, fullWidth, className })
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}

        {!loading && icon && (
          <span className="mr-2">{icon}</span>
        )}

        {loading ? loadingText : children}
      </button>
    )
  }
)

PolarisButton.displayName = 'PolarisButton'

export { PolarisButton, polarisButtonVariants }
