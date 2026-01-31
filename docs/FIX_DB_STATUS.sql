-- ==========================================
-- 기존 대회 상태(status) 일괄 수정
-- ==========================================
-- 문제: 기존 대회가 '모집중'(한글)으로 저장되어 마감으로 보임
-- 해결: 'recruiting'(영문)으로 일괄 변경
-- ==========================================

-- [1] 현재 상태 확인
SELECT 
  status,
  COUNT(*) as count
FROM tournaments
GROUP BY status
ORDER BY count DESC;

-- [2] 한글 '모집중'을 영문 'recruiting'으로 변경
UPDATE tournaments
SET status = 'recruiting'
WHERE status = '모집중' OR status = '모집 중' OR status IS NULL;

-- [3] 한글 '마감'을 영문 'closed'로 변경
UPDATE tournaments
SET status = 'closed'
WHERE status = '마감' OR status = '종료';

-- [4] 변경 후 상태 확인
SELECT 
  status,
  COUNT(*) as count
FROM tournaments
GROUP BY status
ORDER BY count DESC;

-- [5] 날짜가 지난 대회는 자동으로 'closed'로 변경 (선택사항)
-- UPDATE tournaments
-- SET status = 'closed'
-- WHERE date < CURRENT_DATE AND status = 'recruiting';

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ 대회 상태(status) 일괄 수정 완료!';
  RAISE NOTICE '📝 모든 대회가 영문 상태값으로 변경되었습니다.';
  RAISE NOTICE '   - recruiting: 모집중';
  RAISE NOTICE '   - closed: 마감';
END $$;
