-- ==========================================
-- 북마크 기능 RLS 정책 수정
-- ==========================================
-- 문제: 북마크 저장은 되는데 마이페이지에서 안 보임
-- 해결: RLS 정책 재설정
-- ==========================================

-- [1] 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can insert own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON bookmarks;

-- [2] 새 정책 생성

-- 읽기: 본인의 북마크만 조회 가능
CREATE POLICY "Users can view own bookmarks"
ON bookmarks FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 등록: 본인의 북마크만 추가 가능
CREATE POLICY "Users can insert own bookmarks"
ON bookmarks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 삭제: 본인의 북마크만 삭제 가능
CREATE POLICY "Users can delete own bookmarks"
ON bookmarks FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- [3] RLS 활성화 확인
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- [4] 정책 확인
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'bookmarks';

-- [5] 기존 데이터 확인
SELECT 
  COUNT(*) as total_bookmarks,
  COUNT(DISTINCT user_id) as total_users
FROM bookmarks;

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ 북마크 RLS 정책 재설정 완료!';
  RAISE NOTICE '📝 이제 마이페이지에서 북마크를 볼 수 있어야 합니다.';
END $$;
