-- =============================================
-- Supabase Storage Buckets + RLS Policies
-- Выполнить в Supabase SQL Editor
-- =============================================

-- 1. Создание бакетов
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('challenges', 'challenges', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'video/mp4']),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('partners', 'partners', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. RLS Policies для challenges bucket
-- Anyone can read (public bucket)
CREATE POLICY "Public read access for challenges"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'challenges');

-- Authenticated users can upload to their own folder
CREATE POLICY "Authenticated upload to challenges"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'challenges'
    AND auth.role() = 'authenticated'
  );

-- Users can update their own files
CREATE POLICY "Users update own challenge files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'challenges'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own files
CREATE POLICY "Users delete own challenge files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'challenges'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 3. RLS Policies для avatars bucket
CREATE POLICY "Public read access for avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated upload to avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 4. RLS Policies для partners bucket
CREATE POLICY "Public read access for partners"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'partners');

CREATE POLICY "Authenticated upload to partners"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'partners'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users delete own partner files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'partners'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- =============================================
-- Готово! Теперь можно загружать файлы через API.
-- =============================================
