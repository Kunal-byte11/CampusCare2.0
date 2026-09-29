-- ==============================================================================
-- CampusCare Supabase Schema
-- Copy and run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. Student Profiles Table (Integrated with Supabase Auth auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    anon_id VARCHAR(64) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(120),
    course VARCHAR(120) NOT NULL,
    year VARCHAR(60) NOT NULL,
    role VARCHAR(30) DEFAULT 'student',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Standalone Users Table (Alternative direct PostgreSQL table)
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    anon_id VARCHAR(64) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(120),
    course VARCHAR(120),
    year VARCHAR(60),
    role VARCHAR(30) DEFAULT 'student',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_anon_id ON public.profiles(anon_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_users_anon_id ON public.users(anon_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for Profiles
-- Allow authenticated users to view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Allow backend service role / anonymous clients to read and insert
DROP POLICY IF EXISTS "Public read for anon id verification" ON public.profiles;
CREATE POLICY "Public read for anon id verification" 
ON public.profiles FOR SELECT 
TO anon, authenticated, service_role 
USING (true);

DROP POLICY IF EXISTS "Public insert on profiles" ON public.profiles;
CREATE POLICY "Public insert on profiles" 
ON public.profiles FOR INSERT 
TO anon, authenticated, service_role 
WITH CHECK (true);

DROP POLICY IF EXISTS "Public update on profiles" ON public.profiles;
CREATE POLICY "Public update on profiles" 
ON public.profiles FOR UPDATE 
TO anon, authenticated, service_role 
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on profiles" ON public.profiles;
CREATE POLICY "Service role full access on profiles" 
ON public.profiles FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on users" ON public.users;
CREATE POLICY "Service role full access on users" 
ON public.users FOR ALL 
TO service_role, anon 
USING (true) 
WITH CHECK (true);

-- 6. Demo Student Seed (Optional)
INSERT INTO public.users (anon_id, email, password_hash, full_name, course, year, role)
VALUES (
    'anon_demo_gmail',
    'student.demo@gmail.com',
    '$2b$10$DYPVAEWvDLdnPpiqkpUyk.ZjLFOqfK.u8FtumEwT1b1cBGAP8l3TO',
    'Aarav Sharma',
    'Computer Engineering',
    '2nd Year',
    'student'
)
ON CONFLICT (email) DO NOTHING;

-- 7. Seed Official Campus Counselor (Ms. Shahista Kazi)
-- Username: shahista kazi (or shahista.kazi, shahista.kazi@ltce.in)
-- Password: beb40c8aa0ffa05a2157bc3fbbc49b54b9ff5a3fee00539b0b9ebeef845f5d49
INSERT INTO public.users (anon_id, email, password_hash, full_name, course, year, role)
VALUES (
    'shahista kazi',
    'shahista.kazi@ltce.in',
    '$2b$10$vnexU4PTO8UJfJ2Fq/F8lOPN8xZVxUqRD68T9gkgn3hMbATLzgkfu',
    'Ms. Shahista Kazi',
    'Student Welfare & Psychological Counseling',
    'Faculty / Staff',
    'counselor'
)
ON CONFLICT (email) DO UPDATE SET
    anon_id = 'shahista kazi',
    password_hash = '$2b$10$vnexU4PTO8UJfJ2Fq/F8lOPN8xZVxUqRD68T9gkgn3hMbATLzgkfu',
    role = 'counselor',
    full_name = 'Ms. Shahista Kazi';

-- 8. Student Counseling Appointments Table
CREATE TABLE IF NOT EXISTS public.appointments (
    id SERIAL PRIMARY KEY,
    student_anon_id VARCHAR(64) NOT NULL,
    student_name VARCHAR(120),
    student_email VARCHAR(255),
    student_course VARCHAR(120),
    student_year VARCHAR(60),
    counselor_name VARCHAR(120) DEFAULT 'Ms. Shahista Kazi',
    slot_time VARCHAR(120) NOT NULL,
    status VARCHAR(30) DEFAULT 'confirmed', -- 'confirmed', 'completed', 'cancelled'
    session_notes TEXT DEFAULT '',
    booking_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_appointments_counselor ON public.appointments(counselor_name);
CREATE INDEX IF NOT EXISTS idx_appointments_student_anon ON public.appointments(student_anon_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(booking_date);

-- Enable RLS for Appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Full access on appointments for service role and anon" ON public.appointments;
CREATE POLICY "Full access on appointments for service role and anon" 
ON public.appointments FOR ALL 
TO service_role, anon, authenticated 
USING (true) 
WITH CHECK (true);

-- 9. Counselor Clinical Notes Table (Folder & Case File System)
CREATE TABLE IF NOT EXISTS public.clinical_notes (
    id VARCHAR(120) PRIMARY KEY,
    student_anon_id VARCHAR(64) NOT NULL,
    student_name VARCHAR(120),
    student_course VARCHAR(120),
    student_year VARCHAR(60),
    student_email VARCHAR(255),
    file_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    session_date DATE DEFAULT CURRENT_DATE,
    session_time VARCHAR(60) DEFAULT '02:00 PM',
    category VARCHAR(100) DEFAULT 'General Consultation',
    severity VARCHAR(60) DEFAULT 'Normal',
    clinical_observations TEXT DEFAULT '',
    action_plan TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast clinical notes lookups
CREATE INDEX IF NOT EXISTS idx_clinical_notes_student_anon ON public.clinical_notes(student_anon_id);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_date ON public.clinical_notes(session_date);

-- Enable RLS for Clinical Notes
ALTER TABLE public.clinical_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Full access on clinical_notes for service role, anon, authenticated" ON public.clinical_notes;
CREATE POLICY "Full access on clinical_notes for service role, anon, authenticated" 
ON public.clinical_notes FOR ALL 
TO service_role, anon, authenticated 
USING (true) 
WITH CHECK (true);



