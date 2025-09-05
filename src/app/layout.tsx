import type { Metadata } from 'next'
import './globals.css'
import { PolarisProvider } from '@/components/PolarisProvider'
import { AuthProvider } from '@/lib/auth-context'

export const metadata: Metadata = {
  title: 'design4public 콘텐츠관리자',
  description: '콘텐츠 관리 시스템',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <PolarisProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </PolarisProvider>
      </body>
    </html>
  )
}
