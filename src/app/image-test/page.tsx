'use client'

import { useState } from 'react'
import { Page, Layout, Card, Text, Button, Banner } from '@shopify/polaris'
import { MainLayout } from '@/components/layout/MainLayout'
import { ImageUploader } from '@/components/common/ImageUploader'
import { RequireAdmin } from '@/components/auth/AuthGuard'
import type { ImageUploadResult } from '@/services/imageService'

export default function ImageTestPage() {
  const [uploadedImages, setUploadedImages] = useState<ImageUploadResult[]>([])
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleImagesUploaded = (results: ImageUploadResult[]) => {
    setUploadedImages(prev => [...prev, ...results])
    setSuccessMessage(`${results.length}개의 이미지가 성공적으로 업로드되었습니다.`)

    // 3초 후 성공 메시지 제거
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const handleImageRemoved = (index: number) => {
    setUploadedImages(prev => {
      const newImages = [...prev]
      newImages.splice(index, 1)
      return newImages
    })
  }

  const clearAllImages = () => {
    setUploadedImages([])
  }

  return (
    <RequireAdmin>
      <MainLayout>
        <Page
          title="이미지 업로드 테스트"
          primaryAction={
            uploadedImages.length > 0 && (
              <Button variant="primary" tone="critical" onClick={clearAllImages}>
                전체 삭제
              </Button>
            )
          }
        >
          <Layout>
            <Layout.Section>
              {/* 성공 메시지 */}
              {successMessage && (
                <div className="mb-4">
                  <Banner tone="success">
                    {successMessage}
                  </Banner>
                </div>
              )}

              {/* 업로드 통계 */}
              <Card>
                <div className="p-6">
                  <Text variant="headingMd" as="h2">
                    업로드 통계
                  </Text>
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <Text variant="headingXl" as="p">
                        {uploadedImages.length}
                      </Text>
                      <Text variant="bodySm" as="span">
                        업로드된 파일
                      </Text>
                    </div>
                    <div className="text-center">
                      <Text variant="headingXl" as="p">
                        {(uploadedImages.reduce((sum, img) => sum + img.size, 0) / 1024 / 1024).toFixed(2)} MB
                      </Text>
                      <Text variant="bodySm" as="span">
                        총 크기
                      </Text>
                    </div>
                    <div className="text-center">
                      <Text variant="headingXl" as="p">
                        10 MB
                      </Text>
                      <Text variant="bodySm" as="span">
                        최대 파일 크기
                      </Text>
                    </div>
                    <div className="text-center">
                      <Text variant="headingXl" as="p">
                        10
                      </Text>
                      <Text variant="bodySm" color="subdued">
                        최대 파일 수
                      </Text>
                    </div>
                  </div>
                </div>
              </Card>

              {/* 이미지 업로더 */}
              <Card>
                <div className="p-6">
                  <Text variant="headingMd" as="h2">
                    이미지 업로드
                  </Text>
                  <div className="mt-4">
                    <Text variant="bodyMd" color="subdued">
                      지원 형식: JPEG, PNG, WebP, GIF<br />
                      최대 파일 크기: 10MB<br />
                      최대 파일 수: 10개
                    </Text>
                  </div>

                  <div className="mt-6">
                    <ImageUploader
                      onImagesUploaded={handleImagesUploaded}
                      onImageRemoved={handleImageRemoved}
                      maxFiles={10}
                      multiple={true}
                      options={{
                        maxSize: 10,
                        bucket: 'images',
                        folder: 'test-uploads'
                      }}
                    />
                  </div>
                </div>
              </Card>

              {/* 업로드된 이미지 URL 목록 */}
              {uploadedImages.length > 0 && (
                <Card>
                  <div className="p-6">
                    <Text variant="headingMd" as="h2">
                      업로드된 이미지 URL
                    </Text>
                    <div className="mt-4 space-y-2">
                      {uploadedImages.map((image, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded">
                          <Text variant="bodySm" fontWeight="bold">
                            {image.name}
                          </Text>
                          <Text variant="bodySm" color="subdued" className="break-all">
                            {image.url}
                          </Text>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}
            </Layout.Section>
          </Layout>
        </Page>
      </MainLayout>
    </RequireAdmin>
  )
}
