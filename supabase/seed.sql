-- Seed data for initial setup

-- Insert master user (you should replace this with actual user data after signup)
-- Note: This will be created automatically via trigger when user signs up

-- Insert sample brands
INSERT INTO public.brands (name, description, website_url, cover_image_url) VALUES
('Herman Miller', '세계적인 사무용 가구 브랜드로, 혁신적인 디자인과 인체공학적 가구로 유명합니다.', 'https://www.hermanmiller.com', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'),
('Vitra', '스위스 디자인 가구 브랜드로, 현대적인 디자인과 높은 품질로 세계적으로 인정받고 있습니다.', 'https://www.vitra.com', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400'),
('Knoll', '미국 현대 가구 브랜드로, 미드센추리 모던 디자인의 선두주자입니다.', 'https://www.knoll.com', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'),
('Artek', '핀란드 디자인 가구 브랜드로, 알바 알토의 디자인 철학을 계승하고 있습니다.', 'https://www.artek.fi', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400'),
('Fritz Hansen', '덴마크 디자인 가구 브랜드로, 고전적이면서도 현대적인 디자인을 추구합니다.', 'https://www.fritzhansen.com', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'),
('한샘', '국내 대표 가구 브랜드로, 다양한 인테리어 솔루션을 제공합니다.', 'https://www.hansem.com', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400'),
('시디즈', '국내 사무용 가구 전문 브랜드로, 인체공학적 디자인에 특화되어 있습니다.', 'https://www.sidiz.com', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400');

-- Insert sample tags
INSERT INTO public.tags (name) VALUES
('사무용의자'),
('책상'),
('회의실가구'),
('접이식의자'),
('학생용가구'),
('사무실'),
('학교'),
('공공기관'),
('병원'),
('도서관'),
('회의실'),
('접수대'),
('파티션'),
('보관함'),
('커피테이블'),
('라운지체어'),
('작업대'),
('책장'),
('소파'),
('사물함'),
('교탁'),
('연구대'),
('진료대'),
('침대'),
('캐비닛');

-- Insert sample projects
INSERT INTO public.projects (title, description, year, area, status, cover_image_url) VALUES
('서울시청 민원실 리모델링', '서울시청 민원실의 효율적인 공간 재구성을 위한 프로젝트로, 시민들의 대기 시간을 최소화하고 쾌적한 환경을 조성했습니다.', 2024, 850.5, 'published', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600'),
('부산시립도서관 신축', '부산시립도서관의 현대적인 학습 공간 설계로, 다양한 연령대의 이용자들이 편리하게 이용할 수 있는 공간을 만들었습니다.', 2023, 1200.0, 'published', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600'),
('국립중앙의료원 진료동 리노베이션', '국립중앙의료원의 환자 중심 진료 공간 개선으로, 의료진의 효율성과 환자들의 편의성을 높였습니다.', 2024, 650.3, 'draft', 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=600'),
('서울대학교병원 외래센터 리모델링', '서울대학교병원의 외래센터 공간을 현대적으로 리모델링하여 환자들의 이동 동선을 최적화했습니다.', 2023, 950.8, 'published', 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=600'),
('부산교육청 교육청사 사무실 개선', '부산교육청의 노후된 사무 공간을 현대적인 업무 환경으로 개선하여 직원들의 업무 효율성을 높였습니다.', 2024, 720.2, 'draft', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600');

-- Insert sample items
INSERT INTO public.items (name, description, brand_id, image_url, nara_url) VALUES
('Aeron Chair', '인체공학적 디자인의 사무용 의자로 장시간 작업에도 편안함을 제공합니다.', (SELECT id FROM public.brands WHERE name = 'Herman Miller'), 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=300', 'https://www.g2b.go.kr'),
('Panton Chair', '베르너 팬톤의 아이코닉한 디자인의 원목 의자로 모던한 공간에 잘 어울립니다.', (SELECT id FROM public.brands WHERE name = 'Vitra'), 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300', 'https://www.g2b.go.kr'),
('Womb Chair', '아늑하고 편안한 라운지 체어로 휴식 공간에 최적화되어 있습니다.', (SELECT id FROM public.brands WHERE name = 'Knoll'), 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300', 'https://www.g2b.go.kr'),
('Stool E60', '알바 알토의 클래식한 디자인의 스툴로 다양한 용도로 사용할 수 있습니다.', (SELECT id FROM public.brands WHERE name = 'Artek'), 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300', 'https://www.g2b.go.kr'),
('Series 7 Chair', '아르네 야콥센의 유선형 디자인의 의자로 학교 및 사무실에 적합합니다.', (SELECT id FROM public.brands WHERE name = 'Fritz Hansen'), 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300', 'https://www.g2b.go.kr'),
('T3000 사무용의자', '인체공학적 설계의 고급 사무용 의자로 장시간 사용에도 편안합니다.', (SELECT id FROM public.brands WHERE name = '시디즈'), 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=300', 'https://www.g2b.go.kr'),
('모던 책상', '심플하고 모던한 디자인의 책상으로 다양한 사무 환경에 적합합니다.', (SELECT id FROM public.brands WHERE name = '한샘'), 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300', 'https://www.g2b.go.kr'),
('컨퍼런스 테이블', '대형 회의에 적합한 컨퍼런스 테이블로 협업 공간에 최적화되어 있습니다.', (SELECT id FROM public.brands WHERE name = '한샘'), 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300', 'https://www.g2b.go.kr');

-- Insert project images (갤러리 이미지들)
INSERT INTO public.project_images (project_id, image_url, "order") VALUES
((SELECT id FROM public.projects WHERE title = '서울시청 민원실 리모델링'), 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500', 1),
((SELECT id FROM public.projects WHERE title = '서울시청 민원실 리모델링'), 'https://images.unsplash.com/photo-1497366751914-5e25d2e0c63c?w=500', 2),
((SELECT id FROM public.projects WHERE title = '서울시청 민원실 리모델링'), 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500', 3),
((SELECT id FROM public.projects WHERE title = '부산시립도서관 신축'), 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500', 1),
((SELECT id FROM public.projects WHERE title = '부산시립도서관 신축'), 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500', 2),
((SELECT id FROM public.projects WHERE title = '국립중앙의료원 진료동 리노베이션'), 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=500', 1),
((SELECT id FROM public.projects WHERE title = '국립중앙의료원 진료동 리노베이션'), 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500', 2);

-- Insert project-item relationships (프로젝트에 사용된 아이템들)
INSERT INTO public.project_items (project_id, item_id) VALUES
((SELECT id FROM public.projects WHERE title = '서울시청 민원실 리모델링'), (SELECT id FROM public.items WHERE name = 'Aeron Chair')),
((SELECT id FROM public.projects WHERE title = '서울시청 민원실 리모델링'), (SELECT id FROM public.items WHERE name = '모던 책상')),
((SELECT id FROM public.projects WHERE title = '부산시립도서관 신축'), (SELECT id FROM public.items WHERE name = 'Series 7 Chair')),
((SELECT id FROM public.projects WHERE title = '부산시립도서관 신축'), (SELECT id FROM public.items WHERE name = '컨퍼런스 테이블')),
((SELECT id FROM public.projects WHERE title = '국립중앙의료원 진료동 리노베이션'), (SELECT id FROM public.items WHERE name = 'T3000 사무용의자')),
((SELECT id FROM public.projects WHERE title = '서울대학교병원 외래센터 리모델링'), (SELECT id FROM public.items WHERE name = 'Womb Chair'));

-- Insert project-tag relationships (프로젝트 분류 태그들)
INSERT INTO public.project_tags (project_id, tag_id) VALUES
((SELECT id FROM public.projects WHERE title = '서울시청 민원실 리모델링'), (SELECT id FROM public.tags WHERE name = '사무실')),
((SELECT id FROM public.projects WHERE title = '서울시청 민원실 리모델링'), (SELECT id FROM public.tags WHERE name = '공공기관')),
((SELECT id FROM public.projects WHERE title = '서울시청 민원실 리모델링'), (SELECT id FROM public.tags WHERE name = '사무용의자')),
((SELECT id FROM public.projects WHERE title = '부산시립도서관 신축'), (SELECT id FROM public.tags WHERE name = '도서관')),
((SELECT id FROM public.projects WHERE title = '부산시립도서관 신축'), (SELECT id FROM public.tags WHERE name = '공공기관')),
((SELECT id FROM public.projects WHERE title = '부산시립도서관 신축'), (SELECT id FROM public.tags WHERE name = '학생용가구')),
((SELECT id FROM public.projects WHERE title = '국립중앙의료원 진료동 리노베이션'), (SELECT id FROM public.tags WHERE name = '병원')),
((SELECT id FROM public.projects WHERE title = '국립중앙의료원 진료동 리노베이션'), (SELECT id FROM public.tags WHERE name = '공공기관')),
((SELECT id FROM public.projects WHERE title = '서울대학교병원 외래센터 리모델링'), (SELECT id FROM public.tags WHERE name = '병원')),
((SELECT id FROM public.projects WHERE title = '부산교육청 교육청사 사무실 개선'), (SELECT id FROM public.tags WHERE name = '사무실')),
((SELECT id FROM public.projects WHERE title = '부산교육청 교육청사 사무실 개선'), (SELECT id FROM public.tags WHERE name = '공공기관'));

-- Insert image-tag relationships (갤러리 이미지별 태그들)
INSERT INTO public.image_tags (image_id, tag_id) VALUES
((SELECT id FROM public.project_images WHERE project_id = (SELECT id FROM public.projects WHERE title = '서울시청 민원실 리모델링') AND "order" = 1), (SELECT id FROM public.tags WHERE name = '사무실')),
((SELECT id FROM public.project_images WHERE project_id = (SELECT id FROM public.projects WHERE title = '서울시청 민원실 리모델링') AND "order" = 1), (SELECT id FROM public.tags WHERE name = '사무용의자')),
((SELECT id FROM public.project_images WHERE project_id = (SELECT id FROM public.projects WHERE title = '부산시립도서관 신축') AND "order" = 1), (SELECT id FROM public.tags WHERE name = '도서관')),
((SELECT id FROM public.project_images WHERE project_id = (SELECT id FROM public.projects WHERE title = '부산시립도서관 신축') AND "order" = 1), (SELECT id FROM public.tags WHERE name = '책장')),
((SELECT id FROM public.project_images WHERE project_id = (SELECT id FROM public.projects WHERE title = '국립중앙의료원 진료동 리노베이션') AND "order" = 1), (SELECT id FROM public.tags WHERE name = '병원')),
((SELECT id FROM public.project_images WHERE project_id = (SELECT id FROM public.projects WHERE title = '국립중앙의료원 진료동 리노베이션') AND "order" = 1), (SELECT id FROM public.tags WHERE name = '회의실'));

-- Note: In a real application, you would:
-- 1. Replace the master user creation with actual user signup process
-- 2. Add more comprehensive seed data
-- 3. Consider using faker.js or similar for generating test data
-- 4. Add relationships between projects, items, and tags as needed
