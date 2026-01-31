-- ==========================================
-- 🔥 상태 및 위치 데이터 일괄 수정
-- ==========================================
-- 목적: 기존 DB 데이터의 status와 location_city 정규화
-- ==========================================

-- [1] 현재 상태 확인
-- ==========================================
SELECT 
  status, 
  COUNT(*) as count 
FROM tournaments 
GROUP BY status 
ORDER BY count DESC;

-- 현재 location 상태 확인
SELECT 
  location, 
  location_city,
  COUNT(*) as count 
FROM tournaments 
WHERE location = '미정' OR location_city IS NULL
GROUP BY location, location_city
ORDER BY count DESC;

-- [2] Status 수정: 'draft' → 'recruiting' 또는 'closed'
-- ==========================================

-- 2-1. 날짜가 남은 대회는 'recruiting'으로 변경
UPDATE tournaments 
SET status = 'recruiting'
WHERE status = 'draft' 
AND date::date >= CURRENT_DATE;  -- ✅ 타입 캐스팅 추가

-- 2-2. 날짜가 지난 대회는 'closed'로 변경
UPDATE tournaments 
SET status = 'closed'
WHERE status = 'draft' 
AND date::date < CURRENT_DATE;  -- ✅ 타입 캐스팅 추가

-- 2-3. 결과 확인
SELECT 
  status, 
  COUNT(*) as count 
FROM tournaments 
GROUP BY status;

-- [3] Location 수정: 제목에서 지역 추출
-- ==========================================

-- 서울
UPDATE tournaments 
SET 
  location = '서울', 
  location_city = '서울'
WHERE title LIKE '%서울%' 
AND (location = '미정' OR location_city IS NULL);

-- 경기
UPDATE tournaments 
SET 
  location = '경기', 
  location_city = '경기'
WHERE title LIKE '%경기%' 
AND (location = '미정' OR location_city IS NULL);

-- 인천
UPDATE tournaments 
SET 
  location = '인천', 
  location_city = '인천'
WHERE title LIKE '%인천%' 
AND (location = '미정' OR location_city IS NULL);

-- 대전
UPDATE tournaments 
SET 
  location = '대전', 
  location_city = '대전'
WHERE title LIKE '%대전%' 
AND (location = '미정' OR location_city IS NULL);

-- 대구
UPDATE tournaments 
SET 
  location = '대구', 
  location_city = '대구'
WHERE title LIKE '%대구%' 
AND (location = '미정' OR location_city IS NULL);

-- 광주
UPDATE tournaments 
SET 
  location = '광주', 
  location_city = '광주'
WHERE title LIKE '%광주%' 
AND (location = '미정' OR location_city IS NULL);

-- 부산
UPDATE tournaments 
SET 
  location = '부산', 
  location_city = '부산'
WHERE title LIKE '%부산%' 
AND (location = '미정' OR location_city IS NULL);

-- 울산
UPDATE tournaments 
SET 
  location = '울산', 
  location_city = '울산'
WHERE title LIKE '%울산%' 
AND (location = '미정' OR location_city IS NULL);

-- 세종
UPDATE tournaments 
SET 
  location = '세종', 
  location_city = '세종'
WHERE title LIKE '%세종%' 
AND (location = '미정' OR location_city IS NULL);

-- 강원
UPDATE tournaments 
SET 
  location = '강원', 
  location_city = '강원'
WHERE title LIKE '%강원%' 
AND (location = '미정' OR location_city IS NULL);

-- 충북
UPDATE tournaments 
SET 
  location = '충북', 
  location_city = '충북'
WHERE title LIKE '%충북%' 
AND (location = '미정' OR location_city IS NULL);

-- 충남
UPDATE tournaments 
SET 
  location = '충남', 
  location_city = '충남'
WHERE title LIKE '%충남%' 
AND (location = '미정' OR location_city IS NULL);

-- 전북
UPDATE tournaments 
SET 
  location = '전북', 
  location_city = '전북'
WHERE title LIKE '%전북%' 
AND (location = '미정' OR location_city IS NULL);

-- 전남
UPDATE tournaments 
SET 
  location = '전남', 
  location_city = '전남'
WHERE title LIKE '%전남%' 
AND (location = '미정' OR location_city IS NULL);

-- 경북
UPDATE tournaments 
SET 
  location = '경북', 
  location_city = '경북'
WHERE title LIKE '%경북%' 
AND (location = '미정' OR location_city IS NULL);

-- 경남
UPDATE tournaments 
SET 
  location = '경남', 
  location_city = '경남'
WHERE title LIKE '%경남%' 
AND (location = '미정' OR location_city IS NULL);

-- 제주
UPDATE tournaments 
SET 
  location = '제주', 
  location_city = '제주'
WHERE title LIKE '%제주%' 
AND (location = '미정' OR location_city IS NULL);

-- [4] 결과 확인
-- ==========================================

-- 최종 상태 분포
SELECT 
  status, 
  COUNT(*) as count 
FROM tournaments 
GROUP BY status
ORDER BY count DESC;

-- 최종 지역 분포
SELECT 
  location_city, 
  COUNT(*) as count 
FROM tournaments 
GROUP BY location_city
ORDER BY count DESC;

-- 여전히 '미정'인 레코드 확인
SELECT 
  id, 
  title, 
  date, 
  location, 
  location_city,
  status
FROM tournaments 
WHERE location = '미정' OR location_city IS NULL
ORDER BY date DESC
LIMIT 20;

-- ==========================================
-- 완료 메시지
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE '✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨';
  RAISE NOTICE '🎉 데이터 정규화 완료!';
  RAISE NOTICE '✅ status: draft → recruiting/closed';
  RAISE NOTICE '✅ location_city: 제목에서 추출';
  RAISE NOTICE '✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨';
END $$;
