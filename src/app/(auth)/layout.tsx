import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Authentication - Design4Public Console',
  description: 'Login or sign up to access the Design4Public content management system',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Design4Public</h1>
          <p className="mt-2 text-sm text-slate-600">콘텐츠 관리 시스템</p>
        </div>
        {children}
      </div>
    </div>
  )
}
