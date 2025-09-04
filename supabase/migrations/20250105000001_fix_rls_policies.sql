-- Fix RLS policies for profiles table
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins and masters can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Masters can update all profiles" ON public.profiles;

-- Create new simplified policies
-- Allow users to view their own profile
CREATE POLICY "users_select_own" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "users_insert_own" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "users_update_own" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Allow service role to do everything
CREATE POLICY "service_role_all" ON public.profiles
    FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to read profiles (for user management)
CREATE POLICY "authenticated_select_all" ON public.profiles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to update profiles (for admin functions)
CREATE POLICY "authenticated_update_all" ON public.profiles
    FOR UPDATE USING (auth.role() = 'authenticated');
