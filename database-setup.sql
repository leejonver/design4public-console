-- Design4Public Console Database Setup
-- Execute this SQL in your Supabase Dashboard SQL Editor

-- =========================================
-- 1. CREATE PROFILES TABLE AND POLICIES
-- =========================================

-- Create profiles table to extend auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('master', 'admin', 'general')) DEFAULT 'general',
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile (but not role or status)
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- Admins and masters can view all profiles
CREATE POLICY "Admins and masters can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'master')
        )
    );

-- Only masters can update roles and status
CREATE POLICY "Masters can update all profiles" ON public.profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'master'
        )
    );

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role, status)
    VALUES (NEW.id, NEW.email, 'general', 'pending');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function on user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on profile changes
CREATE TRIGGER on_profiles_updated
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- =========================================
-- 2. CREATE PROJECTS AND RELATED TABLES
-- =========================================

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    year INTEGER,
    area NUMERIC,
    status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'hidden')) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create items table
CREATE TABLE IF NOT EXISTS public.items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    brand_id UUID,
    nara_url TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create brands table
CREATE TABLE IF NOT EXISTS public.brands (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    cover_image_url TEXT,
    website_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create tags table
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create project_images table
CREATE TABLE IF NOT EXISTS public.project_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    "order" INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add foreign key constraint to items table
ALTER TABLE public.items ADD CONSTRAINT fk_items_brand_id
    FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE SET NULL;

-- Create junction tables for many-to-many relationships
CREATE TABLE IF NOT EXISTS public.project_items (
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (project_id, item_id)
);

CREATE TABLE IF NOT EXISTS public.project_tags (
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (project_id, tag_id)
);

CREATE TABLE IF NOT EXISTS public.image_tags (
    image_id UUID NOT NULL REFERENCES public.project_images(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (image_id, tag_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_brand_id ON public.items(brand_id);
CREATE INDEX IF NOT EXISTS idx_project_images_project_id ON public.project_images(project_id);
CREATE INDEX IF NOT EXISTS idx_project_images_order ON public.project_images("order");
CREATE INDEX IF NOT EXISTS idx_project_items_project_id ON public.project_items(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tags_project_id ON public.project_tags(project_id);
CREATE INDEX IF NOT EXISTS idx_image_tags_image_id ON public.image_tags(image_id);

-- Enable Row Level Security on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for projects table
-- Everyone can read published projects
CREATE POLICY "Everyone can view published projects" ON public.projects
    FOR SELECT USING (status = 'published');

-- Authenticated users can read all projects
CREATE POLICY "Authenticated users can view all projects" ON public.projects
    FOR SELECT USING (auth.role() = 'authenticated');

-- General users can create projects
CREATE POLICY "General users can create projects" ON public.projects
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can update their own projects
CREATE POLICY "Users can update own projects" ON public.projects
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Admins and masters can update all projects
CREATE POLICY "Admins and masters can update all projects" ON public.projects
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'master')
        )
    );

-- Similar policies for other tables (basic read access for authenticated users)
CREATE POLICY "Authenticated users can view items" ON public.items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage items" ON public.items
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view brands" ON public.brands
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage brands" ON public.brands
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view tags" ON public.tags
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage tags" ON public.tags
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view project images" ON public.project_images
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage project images" ON public.project_images
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage project items" ON public.project_items
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage project tags" ON public.project_tags
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage image tags" ON public.image_tags
    FOR ALL USING (auth.role() = 'authenticated');

-- Add updated_at triggers for all tables
CREATE TRIGGER on_projects_updated
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_items_updated
    BEFORE UPDATE ON public.items
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_brands_updated
    BEFORE UPDATE ON public.brands
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- =========================================
-- 3. SEED DATA
-- =========================================

-- Insert some sample brands
INSERT INTO public.brands (name, description, website_url) VALUES
('Herman Miller', '세계적인 사무용 가구 브랜드', 'https://www.hermanmiller.com'),
('Vitra', '스위스 디자인 가구 브랜드', 'https://www.vitra.com'),
('Knoll', '미국 현대 가구 브랜드', 'https://www.knoll.com'),
('Artek', '핀란드 디자인 가구 브랜드', 'https://www.artek.fi'),
('Fritz Hansen', '덴마크 디자인 가구 브랜드', 'https://www.fritzhansen.com');

-- Insert some sample tags
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
('커피테이블');

-- Insert sample projects
INSERT INTO public.projects (title, description, year, area, status) VALUES
('서울시청 민원실 리모델링', '서울시청 민원실의 효율적인 공간 재구성을 위한 프로젝트', 2024, 850.5, 'published'),
('부산시립도서관 신축', '부산시립도서관의 현대적인 학습 공간 설계', 2023, 1200.0, 'published'),
('국립중앙의료원 진료동 리노베이션', '국립중앙의료원의 환자 중심 진료 공간 개선', 2024, 650.3, 'draft');

-- Insert sample items
INSERT INTO public.items (name, description, brand_id) VALUES
('Aeron Chair', '인체공학적 디자인의 사무용 의자', (SELECT id FROM public.brands WHERE name = 'Herman Miller')),
('Panton Chair', '원목 디자인의 클래식 의자', (SELECT id FROM public.brands WHERE name = 'Vitra')),
('Womb Chair', '아늑한 라운지 체어', (SELECT id FROM public.brands WHERE name = 'Knoll')),
('Stool E60', '알바 알토 디자인의 스툴', (SELECT id FROM public.brands WHERE name = 'Artek')),
('Series 7 Chair', '아르네 야콥센 디자인의 의자', (SELECT id FROM public.brands WHERE name = 'Fritz Hansen'));

-- Success message
SELECT 'Database setup completed successfully!' as message;
