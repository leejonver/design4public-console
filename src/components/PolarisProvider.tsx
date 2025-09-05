'use client'

import { AppProvider } from '@shopify/polaris'
import '@shopify/polaris/build/esm/styles.css'

interface PolarisProviderProps {
  children: React.ReactNode
}

export function PolarisProvider({ children }: PolarisProviderProps) {
  return (
    <AppProvider
      i18n={{
        Polaris: {
          ResourceList: {
            showing: '{itemsCount} {resource} 중 {itemsCount}개 표시',
            defaultItemPlural: '개',
            defaultItemSingular: '개',
            filtered: '{itemsCount} {resource} 일치',
            Item: {
              viewItem: '{resourceName} 보기',
            },
          },
          Common: {
            cancel: '취소',
            save: '저장',
            delete: '삭제',
            search: '검색',
            clear: '초기화',
            edit: '편집',
            new: '새로 만들기',
            create: '생성',
            duplicate: '복제',
            remove: '제거',
            loading: '로딩 중...',
            apply: '적용',
            undo: '실행 취소',
          },
          IndexTable: {
            emptyState: {
              title: '데이터가 없습니다',
              description: '아직 등록된 항목이 없습니다.',
            },
          },
        },
      }}
    >
      {children}
    </AppProvider>
  )
}
