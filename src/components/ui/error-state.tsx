import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ErrorAlertProps {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorAlert({ title = "오류 발생", message, onRetry, className }: ErrorAlertProps) {
  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{message}</span>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="h-3 w-3 mr-1" />
            다시 시도
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}

interface ErrorCardProps {
  title?: string
  message: string
  icon?: React.ReactNode
  onRetry?: () => void
  onGoHome?: () => void
  className?: string
}

export function ErrorCard({
  title = "문제가 발생했습니다",
  message,
  icon,
  onRetry,
  onGoHome,
  className
}: ErrorCardProps) {
  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          {icon || <AlertTriangle className="h-12 w-12 text-destructive mb-4" />}
          <CardTitle className="mb-2">{title}</CardTitle>
          <CardDescription className="mb-6 max-w-md">
            {message}
          </CardDescription>
          <div className="flex gap-3">
            {onRetry && (
              <Button onClick={onRetry} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                다시 시도
              </Button>
            )}
            {onGoHome && (
              <Button onClick={onGoHome}>
                <Home className="h-4 w-4 mr-2" />
                홈으로
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface ErrorPageProps {
  title?: string
  message: string
  onRetry?: () => void
  onGoHome?: () => void
}

export function ErrorPage({ title = "페이지를 찾을 수 없습니다", message, onRetry, onGoHome }: ErrorPageProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center max-w-md">
        <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-6" />
        <h1 className="text-2xl font-bold mb-4">{title}</h1>
        <p className="text-muted-foreground mb-8">
          {message}
        </p>
        <div className="flex gap-3 justify-center">
          {onRetry && (
            <Button onClick={onRetry} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              다시 시도
            </Button>
          )}
          {onGoHome && (
            <Button onClick={onGoHome}>
              <Home className="h-4 w-4 mr-2" />
              홈으로 돌아가기
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
