-- ==========================================
-- 북마크 테이블 상태 확인
-- ==========================================

-- [1] bookmarks 테이블 구조 확인
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'bookmarks'
ORDER BY ordinal_position;

-- [2] bookmarks 테이블에 저장된 데이터 확인
SELECT 
  id,
  user_id,
  tournament_id,
  created_at
FROM bookmarks
ORDER BY created_at DESC
LIMIT 10;

-- [3] RLS 정책 확인
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'bookmarks';

-- [4] RLS 활성화 여부 확인
SELECT 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'bookmarks';

-- [5] 북마크 데이터와 대회 데이터 조인 테스트
SELECT 
  b.id as bookmark_id,
  b.user_id,
  b.tournament_id,
  t.title as tournament_title,
  t.status as tournament_status,
  b.created_at
FROM bookmarks b
LEFT JOIN tournaments t ON t.id = b.tournament_id
ORDER BY b.created_at DESC
LIMIT 10;

-- [6] 통계
SELECT 
  COUNT(*) as total_bookmarks,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT tournament_id) as unique_tournaments
FROM bookmarks;
