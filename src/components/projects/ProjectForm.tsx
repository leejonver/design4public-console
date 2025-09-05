'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, FormLayout, TextField, Select, Button, Banner, Text, DropZone, Thumbnail, Stack, RadioButton, Icon, ChoiceList } from '@shopify/polaris'
import { projectService } from '@/services/projectService'
import { tagService } from '@/services/tagService'
import { itemService } from '@/services/itemService'
import type { ProjectInsert, ProjectUpdate, Project, Tag, Item } from '@/types/database'

interface ProjectFormProps {
  project?: Project
  onSuccess: () => void
  onCancel: () => void
}

const statusOptions = [
  { label: '초안', value: 'draft' },
  { label: '게시됨', value: 'published' },
  { label: '숨김', value: 'hidden' }
]

export function ProjectForm({ project, onSuccess, onCancel }: ProjectFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadingImages, setUploadingImages] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 아이템 관련 상태
  const [availableItems, setAvailableItems] = useState<Item[]>([])
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])

  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    year: project?.year?.toString() || '',
    area: project?.area?.toString() || '',
    status: project?.status || 'draft'
  })

  // 이미지 상태 관리
  const [projectImages, setProjectImages] = useState<Array<{
    id?: string
    image_url: string
    order: number
    file?: File
  }>>(project?.project_images || (project ? [
    { id: 'img1', image_url: 'https://via.placeholder.com/200x150?text=Image1', order: 0 },
    { id: 'img2', image_url: 'https://via.placeholder.com/200x150?text=Image2', order: 1 },
    { id: 'img3', image_url: 'https://via.placeholder.com/200x150?text=Image3', order: 2 }
  ] : []))
  const [coverImageUrl, setCoverImageUrl] = useState<string>(project?.cover_image_url || (project ? 'https://via.placeholder.com/200x150?text=Image1' : ''))

  // 태그 관련 상태 관리
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    project?.project_tags?.map(pt => pt.tag_id) || []
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 프로젝트 데이터
      const projectData: ProjectInsert = {
        title: formData.title,
        description: formData.description || null,
        year: formData.year ? parseInt(formData.year) : null,
        area: formData.area ? parseFloat(formData.area) : null,
        status: formData.status,
        cover_image_url: coverImageUrl || null
      }

      let savedProject: Project

      if (project) {
        // 수정
        savedProject = await projectService.updateProject(project.id, projectData as ProjectUpdate)
      } else {
        // 생성
        savedProject = await projectService.createProject(projectData)
      }

      // 이미지 업로드 및 저장
      if (projectImages.length > 0) {
        for (const [index, image] of projectImages.entries()) {
          if (image.file) {
            // 새로 업로드된 파일
            try {
              const uploadedUrl = await projectService.uploadImage(image.file, savedProject.id)
              await projectService.addProjectImage(savedProject.id, uploadedUrl, index)
            } catch (uploadError) {
              console.error('Image upload failed:', uploadError)
              // 이미지 업로드 실패해도 프로젝트 저장은 유지
            }
          } else if (image.id) {
            // 기존 이미지의 순서 업데이트
            await projectService.updateImageOrder(image.id, index)
          }
        }
      }

      // 태그 연결 처리
      if (selectedTagIds.length > 0) {
        for (const tagId of selectedTagIds) {
          try {
            await projectService.addProjectTag(savedProject.id, tagId)
          } catch (tagError) {
            console.error('Tag association failed:', tagError)
            // 태그 연결 실패해도 프로젝트 저장은 유지
          }
        }
      }

      // 아이템 연결 처리
      if (selectedItemIds.length > 0) {
        for (const itemId of selectedItemIds) {
          try {
            await projectService.addProjectItem(savedProject.id, itemId)
          } catch (itemError) {
            console.error('Item association failed:', itemError)
            // 아이템 연결 실패해도 프로젝트 저장은 유지
          }
        }
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : '프로젝트 저장 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // 이미지 파일 선택 핸들러
  const handleFileSelect = async (files: File[]) => {
    if (!files.length) return

    setUploadingImages(true)
    setError(null)

    try {
      const newImages = [...projectImages]

      for (const file of files) {
        // 파일 크기 검증 (10MB 제한)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`${file.name} 파일이 너무 큽니다. 10MB 이하의 파일만 업로드 가능합니다.`)
        }

        // 파일 타입 검증
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name}은 이미지 파일이 아닙니다.`)
        }

        // 미리보기 URL 생성
        const previewUrl = URL.createObjectURL(file)

        newImages.push({
          image_url: previewUrl,
          order: newImages.length,
          file
        })
      }

      setProjectImages(newImages)

      // 첫 번째 이미지를 커버 이미지로 자동 설정 (기존 커버 이미지가 없는 경우)
      if (!coverImageUrl && newImages.length > 0) {
        setCoverImageUrl(newImages[0].image_url)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '파일 선택 중 오류가 발생했습니다.')
    } finally {
      setUploadingImages(false)
    }
  }

  // 이미지 삭제 핸들러
  const handleRemoveImage = (index: number) => {
    const newImages = [...projectImages]
    const removedImage = newImages[index]

    // 미리보기 URL 해제
    if (removedImage.file) {
      URL.revokeObjectURL(removedImage.image_url)
    }

    newImages.splice(index, 1)

    // 삭제된 이미지가 커버 이미지였으면 첫 번째 이미지로 변경
    if (removedImage.image_url === coverImageUrl) {
      setCoverImageUrl(newImages.length > 0 ? newImages[0].image_url : '')
    }

    setProjectImages(newImages)
  }

  // 커버 이미지 선택 핸들러
  const handleCoverImageChange = (imageUrl: string) => {
    setCoverImageUrl(imageUrl)
  }

  // 태그와 아이템 목록 불러오기
  useEffect(() => {
    const loadData = async () => {
      try {
        // 태그 데이터 로드
        const testTags = [
          {
            id: 'tag1',
            name: '현대적',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'tag2',
            name: '클래식',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'tag3',
            name: '미니멀',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'tag4',
            name: '인체공학적',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'tag5',
            name: '친환경',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
        setAvailableTags(testTags)

        // 아이템 데이터 로드
        const testItems = [
          {
            id: 'item1',
            name: '사무용 책상',
            description: '편안한 작업을 위한 사무용 책상',
            brand_id: 'brand1',
            nara_url: 'https://www.g2b.go.kr/example1',
            image_url: 'https://via.placeholder.com/200x150?text=사무용책상',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'item2',
            name: '사무용 의자',
            description: '인체공학적 디자인의 사무용 의자',
            brand_id: 'brand2',
            nara_url: 'https://www.g2b.go.kr/example2',
            image_url: 'https://via.placeholder.com/200x150?text=사무용의자',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'item3',
            name: '책상용 조명',
            description: '눈부심 방지 LED 조명',
            brand_id: 'brand1',
            nara_url: 'https://www.g2b.go.kr/example3',
            image_url: 'https://via.placeholder.com/200x150?text=책상용조명',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
        setAvailableItems(testItems)

        // 기존 프로젝트의 연결된 아이템들 로드
        if (project?.id) {
          const connectedItems = testItems.filter(item =>
            ['item1', 'item2'].includes(item.id) // 임시로 일부 아이템을 연결된 것으로 가정
          )
          setSelectedItemIds(connectedItems.map(item => item.id))
        }
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    }

    loadData()
  }, [project])

  // 태그 선택 핸들러
  const handleTagChange = (selected: string[]) => {
    setSelectedTagIds(selected)
  }

  // 아이템 선택 핸들러
  const handleItemChange = (selected: string[]) => {
    setSelectedItemIds(selected)
  }

  return (
    <Card>
      <div className="p-6">
        <div className="mb-6">
          <Text variant="headingLg" as="h1">
            {project ? '프로젝트 수정' : '새 프로젝트'}
          </Text>
        </div>

        {error && (
          <div className="mb-4">
            <Banner status="critical">
              {error}
            </Banner>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <FormLayout>
            <TextField
              label="제목"
              value={formData.title}
              onChange={handleChange('title')}
              required
              placeholder="프로젝트 제목을 입력하세요"
            />

            <TextField
              label="설명"
              value={formData.description}
              onChange={handleChange('description')}
              multiline={4}
              placeholder="프로젝트 설명을 입력하세요"
            />

            <div className="grid grid-cols-2 gap-4">
              <TextField
                label="연도"
                type="number"
                value={formData.year}
                onChange={handleChange('year')}
                placeholder="2024"
              />

              <TextField
                label="면적 (㎡)"
                type="number"
                step="0.01"
                value={formData.area}
                onChange={handleChange('area')}
                placeholder="100.50"
              />
            </div>

            <Select
              label="상태"
              options={statusOptions}
              value={formData.status}
              onChange={handleChange('status')}
            />

            {/* 태그 선택 섹션 */}
            <div className="space-y-4">
              <Text variant="headingMd" as="h3">
                프로젝트 태그
              </Text>

              {availableTags.length > 0 ? (
                <ChoiceList
                  allowMultiple
                  title=""
                  choices={availableTags.map(tag => ({
                    label: tag.name,
                    value: tag.id,
                    helpText: `생성일: ${new Date(tag.created_at).toLocaleDateString('ko-KR')}`
                  }))}
                  selected={selectedTagIds}
                  onChange={handleTagChange}
                />
              ) : (
                <Text variant="bodyMd" color="subdued">
                  사용할 수 있는 태그가 없습니다. 먼저 태그를 생성해주세요.
                </Text>
              )}

              {selectedTagIds.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedTagIds.map(tagId => {
                    const tag = availableTags.find(t => t.id === tagId)
                    return tag ? (
                      <div key={tagId} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                        {tag.name}
                      </div>
                    ) : null
                  })}
                </div>
              )}
            </div>

            {/* 아이템 선택 섹션 */}
            <div className="space-y-4">
              <Text variant="headingMd" as="h3">
                관련 아이템
              </Text>

              {availableItems.length > 0 ? (
                <ChoiceList
                  allowMultiple
                  title=""
                  choices={availableItems.map(item => ({
                    label: item.name,
                    value: item.id,
                    helpText: `${item.description || '설명 없음'}`
                  }))}
                  selected={selectedItemIds}
                  onChange={handleItemChange}
                />
              ) : (
                <Text variant="bodyMd" color="subdued">
                  사용할 수 있는 아이템이 없습니다. 먼저 아이템을 생성해주세요.
                </Text>
              )}

              {selectedItemIds.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedItemIds.map(itemId => {
                    const item = availableItems.find(i => i.id === itemId)
                    return item ? (
                      <div key={itemId} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                        {item.name}
                      </div>
                    ) : null
                  })}
                </div>
              )}
            </div>

            {/* 이미지 업로드 섹션 */}
            <div className="space-y-4">
              <Text variant="headingMd" as="h3">
                프로젝트 이미지
              </Text>

              {/* 이미지 업로드 드롭존 */}
              <DropZone
                accept="image/*"
                type="file"
                onDrop={handleFileSelect}
                disabled={uploadingImages}
              >
                <DropZone.FileUpload
                  actionHint="또는 파일을 클릭해서 선택"
                />
              </DropZone>

              {/* 업로드된 이미지 목록 */}
              {projectImages.length > 0 && (
                <div className="space-y-4">
                  <Text variant="bodyMd" fontWeight="bold">
                    업로드된 이미지 ({projectImages.length}개)
                  </Text>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {projectImages.map((image, index) => (
                      <div key={index} className="relative">
                        <div className="border rounded-lg p-2">
                          <Thumbnail
                            source={image.image_url}
                            alt={`프로젝트 이미지 ${index + 1}`}
                            size="large"
                          />

                          {/* 커버 이미지 선택 라디오 버튼 */}
                          <div className="mt-2">
                            <RadioButton
                              label="커버 이미지"
                              checked={coverImageUrl === image.image_url}
                              onChange={() => handleCoverImageChange(image.image_url)}
                            />
                          </div>

                          {/* 이미지 삭제 버튼 */}
                          <div className="mt-2">
                            <Button
                              size="slim"
                              destructive
                              onClick={() => handleRemoveImage(index)}
                            >
                              삭제
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {coverImageUrl && (
                    <Banner status="info">
                      선택된 커버 이미지: {projectImages.find(img => img.image_url === coverImageUrl) ?
                        `이미지 ${projectImages.findIndex(img => img.image_url === coverImageUrl) + 1}` :
                        '없음'}
                    </Banner>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                primary
                submit
                loading={loading}
                disabled={!formData.title.trim()}
              >
                {project ? '수정하기' : '생성하기'}
              </Button>

              <Button
                onClick={onCancel}
              >
                취소
              </Button>
            </div>
          </FormLayout>
        </form>
      </div>
    </Card>
  )
}
