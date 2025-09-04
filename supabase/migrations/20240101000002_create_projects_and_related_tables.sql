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

-- Users can update their own projects (if they're the creator - we'll add creator_id later)
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
