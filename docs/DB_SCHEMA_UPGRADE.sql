-- ==========================================
-- DB 스키마 업그레이드 (상세 페이지 완벽 지원)
-- ==========================================
-- 목적: tournaments/[id] 페이지의 모든 정보를 저장할 수 있도록 테이블 확장
-- ==========================================

-- [1] 기존 tournaments 테이블 컬럼 확인
-- 현재 있는 컬럼:
-- - id, title, date, location, category, description
-- - max_participants, current_participants, status
-- - thumbnail_url, registration_link, view_count
-- - created_at, updated_at

-- [2] 추가 필요 컬럼 (상세 페이지 분석 결과)

-- 🎯 기본 정보 확장
DO $$
BEGIN
  -- 부제목/슬로건
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournaments' AND column_name = 'subtitle'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN subtitle text;
    RAISE NOTICE '✅ subtitle 컬럼 추가 완료';
  END IF;

  -- 종료 날짜 (시작일과 종료일 구분)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournaments' AND column_name = 'end_date'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN end_date date;
    RAISE NOTICE '✅ end_date 컬럼 추가 완료';
  END IF;

  -- 시작 날짜로 date 컬럼 의미 명확화
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournaments' AND column_name = 'start_date'
  ) THEN
    -- date를 start_date로 rename (선택적)
    -- ALTER TABLE tournaments RENAME COLUMN date TO start_date;
    RAISE NOTICE 'ℹ️  date 컬럼은 start_date로 사용 (별도 rename 생략)';
  END IF;
END $$;

-- 🏢 장소 정보 확장
DO $$
BEGIN
  -- 도시/지역
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournaments' AND column_name = 'location_city'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN location_city text;
    RAISE NOTICE '✅ location_city 컬럼 추가 완료';
  END IF;

  -- 상세 주소
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournaments' AND column_name = 'location_detail'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN location_detail text;
    RAISE NOTICE '✅ location_detail 컬럼 추가 완료';
  END IF;
END $$;

-- 👥 참가 정보 확장
DO $$
BEGIN
  -- 참가비 (팀당)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournaments' AND column_name = 'fee'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN fee integer DEFAULT 0;
    RAISE NOTICE '✅ fee 컬럼 추가 완료';
  END IF;

  -- 참가 부서 (JSON 배열: ["개나리부", "국화부"])
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournaments' AND column_name = 'divisions'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN divisions jsonb DEFAULT '[]'::jsonb;
    RAISE NOTICE '✅ divisions 컬럼 추가 완료';
  END IF;
END $$;

-- 📝 상세 콘텐츠 확장
DO $$
BEGIN
  -- 대회 개요 (간단한 소개)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournaments' AND column_name = 'content_overview'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN content_overview text;
    RAISE NOTICE '✅ content_overview 컬럼 추가 완료';
  END IF;

  -- 모집 요강 (상세 설명)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournaments' AND column_name = 'content_recruitment'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN content_recruitment text;
    RAISE NOTICE '✅ content_recruitment 컬럼 추가 완료';
  END IF;

  -- 대회 규정
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournaments' AND column_name = 'content_rules'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN content_rules text;
    RAISE NOTICE '✅ content_rules 컬럼 추가 완료';
  END IF;
END $$;

-- 🏆 상금/일정 정보 (JSON 저장)
DO $$
BEGIN
  -- 상금 정보 (JSON 배열)
  -- [{"rank": "우승", "reward": "상금 100만원"}]
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournaments' AND column_name = 'prizes'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN prizes jsonb DEFAULT '[]'::jsonb;
    RAISE NOTICE '✅ prizes 컬럼 추가 완료';
  END IF;

  -- 일정 정보 (JSON 배열)
  -- [{"date": "2026.03.07", "division": "개나리부", "time": "09:00"}]
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournaments' AND column_name = 'schedule'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN schedule jsonb DEFAULT '[]'::jsonb;
    RAISE NOTICE '✅ schedule 컬럼 추가 완료';
  END IF;
END $$;

-- 💰 입금 계좌 정보
DO $$
BEGIN
  -- 계좌번호
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournaments' AND column_name = 'account'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN account text;
    RAISE NOTICE '✅ account 컬럼 추가 완료';
  END IF;

  -- 예금주
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournaments' AND column_name = 'account_holder'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN account_holder text;
    RAISE NOTICE '✅ account_holder 컬럼 추가 완료';
  END IF;
END $$;

-- [3] 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_tournaments_location_city ON tournaments(location_city);
CREATE INDEX IF NOT EXISTS idx_tournaments_divisions ON tournaments USING gin(divisions);
CREATE INDEX IF NOT EXISTS idx_tournaments_fee ON tournaments(fee);

-- [4] 기존 데이터 마이그레이션 (location을 location_city로 복사)
UPDATE tournaments 
SET location_city = location 
WHERE location_city IS NULL AND location IS NOT NULL;

-- ==========================================
-- 완료 메시지
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE '✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨';
  RAISE NOTICE '🎉 DB 스키마 업그레이드 완료!';
  RAISE NOTICE '📊 추가된 컬럼: subtitle, end_date, location_city, location_detail';
  RAISE NOTICE '📊 추가된 JSON: divisions, prizes, schedule';
  RAISE NOTICE '💰 추가된 결제: fee, account, account_holder';
  RAISE NOTICE '📝 추가된 콘텐츠: content_overview, content_recruitment, content_rules';
  RAISE NOTICE '✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨';
END $$;

-- ==========================================
-- 예시 데이터 (테스트용)
-- ==========================================
/*
INSERT INTO tournaments (
  title,
  subtitle,
  date,
  end_date,
  location,
  location_city,
  location_detail,
  category,
  max_participants,
  fee,
  divisions,
  prizes,
  schedule,
  account,
  account_holder,
  content_overview,
  content_recruitment,
  content_rules,
  thumbnail_url,
  registration_link,
  status
) VALUES (
  '제5회 Kim''s 전국동호인테니스대회',
  '테니스를 사랑하는 모든 이들을 위한 축제',
  '2026-03-07',
  '2026-03-08',
  '경북대학교 테니스장',
  '경북',
  '경북 대구광역시 북구 대학로 80',
  '일반',
  32,
  54000,
  '["개나리부", "국화부", "챌린저부", "마스터스부"]'::jsonb,
  '[
    {"rank": "우승 (1위)", "reward": "상금 100만원 + 상패"},
    {"rank": "준우승 (2위)", "reward": "상금 60만원 + 상패"},
    {"rank": "3위", "reward": "상금 40만원 + 상패"}
  ]'::jsonb,
  '[
    {"date": "2026.03.07 (토)", "division": "개나리부 / 국화부", "time": "오전 09:00"},
    {"date": "2026.03.08 (일)", "division": "챌린저부 / 마스터스부", "time": "오전 09:00"}
  ]'::jsonb,
  '국민은행 000-000-000000',
  '김테니스',
  '전국 동호인 테니스 대회를 개최합니다.',
  '대회 규정을 꼭 확인해주세요.',
  '복식 경기 (2인 1팀), 토너먼트 방식 진행',
  '/images/kato-groupa.png',
  '',
  'recruiting'
);
*/
