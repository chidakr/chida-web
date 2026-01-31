-- ==========================================
-- tournament_divisions RLS 정책 수정
-- ==========================================
-- 문제: 크롤러가 anon key로 INSERT 시도 → RLS로 차단됨
-- 해결: anon 역할도 INSERT 가능하도록 정책 수정
-- ==========================================

-- [1] 기존 정책 삭제
DROP POLICY IF EXISTS "Authenticated users can manage divisions" ON tournament_divisions;
DROP POLICY IF EXISTS "Anyone can view divisions" ON tournament_divisions;

-- [2] 새 정책 생성

-- 읽기: 누구나 가능
CREATE POLICY "Anyone can read divisions"
ON tournament_divisions FOR SELECT
TO public
USING (true);

-- 삽입: anon과 authenticated 모두 가능
CREATE POLICY "Public can insert divisions"
ON tournament_divisions FOR INSERT
TO public
WITH CHECK (true);

-- 수정: authenticated만 가능 (관리자 페이지용)
CREATE POLICY "Authenticated can update divisions"
ON tournament_divisions FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 삭제: authenticated만 가능 (관리자 페이지용)
CREATE POLICY "Authenticated can delete divisions"
ON tournament_divisions FOR DELETE
TO authenticated
USING (true);

-- [3] 정책 확인
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'tournament_divisions';

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ tournament_divisions RLS 정책 수정 완료!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '📖 SELECT: public (누구나)';
  RAISE NOTICE '➕ INSERT: public (크롤러 포함)';
  RAISE NOTICE '✏️  UPDATE: authenticated (관리자만)';
  RAISE NOTICE '🗑️  DELETE: authenticated (관리자만)';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;
