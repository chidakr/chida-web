-- ==========================================
-- 치다 프로젝트 RLS 정책 긴급 수정
-- ==========================================
-- 문제: 삭제는 되는데 등록/수정이 안 됨
-- 해결: RLS 정책 재설정
-- ==========================================

-- [1] 기존 정책 모두 삭제
DROP POLICY IF EXISTS "Enable read access for all users" ON tournaments;
DROP POLICY IF EXISTS "Authenticated users can insert tournaments" ON tournaments;
DROP POLICY IF EXISTS "Authenticated users can update tournaments" ON tournaments;
DROP POLICY IF EXISTS "Authenticated users can delete tournaments" ON tournaments;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON tournaments;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON tournaments;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON tournaments;

-- [2] 새 정책 생성 (더 강력한 권한)

-- 읽기: 누구나 가능
CREATE POLICY "Anyone can read tournaments"
ON tournaments FOR SELECT
TO public
USING (true);

-- 등록: 인증된 사용자만
CREATE POLICY "Authenticated can insert tournaments"
ON tournaments FOR INSERT
TO authenticated
WITH CHECK (true);

-- 수정: 인증된 사용자만
CREATE POLICY "Authenticated can update tournaments"
ON tournaments FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 삭제: 인증된 사용자만
CREATE POLICY "Authenticated can delete tournaments"
ON tournaments FOR DELETE
TO authenticated
USING (true);

-- [3] RLS 활성화 확인
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

-- [4] 정책 확인
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'tournaments';

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ RLS 정책 재설정 완료!';
  RAISE NOTICE '📝 이제 등록/수정/삭제가 모두 작동해야 합니다.';
  RAISE NOTICE '🔐 인증된 사용자만 데이터 변경 가능';
END $$;
