-- ==========================================
-- Supabase Storage 설정 (이미지 업로드용)
-- ==========================================
-- 목적: tournaments 버킷 생성 및 권한 설정
-- ==========================================

-- [1] Storage 버킷이 없으면 생성 (Supabase Dashboard에서 실행)
-- Storage → Buckets → Create Bucket
-- 버킷명: tournaments
-- Public: true (공개 접근 허용)

-- [2] Storage RLS 정책 설정
-- 아래 쿼리는 Supabase SQL Editor에서 실행

-- 모든 사용자가 이미지를 볼 수 있도록 (Public Read)
CREATE POLICY "Public can view tournament images"
ON storage.objects FOR SELECT
USING (bucket_id = 'tournaments');

-- 인증된 사용자(관리자)만 업로드 가능
CREATE POLICY "Authenticated users can upload tournament images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tournaments');

-- 인증된 사용자(관리자)만 업데이트 가능
CREATE POLICY "Authenticated users can update tournament images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'tournaments')
WITH CHECK (bucket_id = 'tournaments');

-- 인증된 사용자(관리자)만 삭제 가능
CREATE POLICY "Authenticated users can delete tournament images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'tournaments');

-- ==========================================
-- ✅ 설정 완료 체크리스트
-- ==========================================

/*
[ ] 1. Supabase Dashboard → Storage → "tournaments" 버킷 생성됨
[ ] 2. 버킷 Public 설정 ON
[ ] 3. 위 SQL 쿼리 실행 완료
[ ] 4. Admin 페이지에서 이미지 업로드 테스트
*/

-- ==========================================
-- 문제 해결
-- ==========================================

/*
[문제 1] "Bucket not found" 에러
→ Supabase Dashboard에서 Storage 탭으로 가서 "tournaments" 버킷 수동 생성

[문제 2] "Permission denied" 에러
→ 위 RLS 정책 SQL 실행

[문제 3] "Policy already exists" 에러
→ 기존 정책 삭제 후 재생성:

DROP POLICY IF EXISTS "Public can view tournament images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload tournament images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update tournament images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete tournament images" ON storage.objects;

-- 그 다음 위 CREATE POLICY 문 다시 실행
*/
