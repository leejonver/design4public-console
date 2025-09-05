'use client'

import { ReactNode } from 'react'
import { Frame } from '@shopify/polaris'
import { Sidebar } from './Sidebar'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <Frame
      navigation={<Sidebar />}
    >
      {children}
    </Frame>
  )
}
