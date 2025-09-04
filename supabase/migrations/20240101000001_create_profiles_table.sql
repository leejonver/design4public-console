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

-- Users can insert their own profile (for signup)
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile (but not role or status)
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Service role can do everything (for admin operations)
CREATE POLICY "Service role can manage all profiles" ON public.profiles
    FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to read all profiles (for user management)
CREATE POLICY "Authenticated users can view all profiles" ON public.profiles
    FOR SELECT USING (auth.role() = 'authenticated');

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
