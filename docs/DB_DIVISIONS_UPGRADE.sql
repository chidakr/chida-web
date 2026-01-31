-- ==========================================
-- 🔥 DB 스키마 재설계: 1:N 구조 도입 (무신사 옵션 스타일)
-- ==========================================
-- 목적: 대회의 세부 종목(개나리부, 국화부 등)을 별도 테이블로 관리
-- 버그 수정: 위치 미정, 참가비 무료, 상태 마감 문제 완전 해결
-- ==========================================

-- [1] tournament_divisions 테이블 생성 (자식 테이블)
-- ==========================================
CREATE TABLE IF NOT EXISTS tournament_divisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  
  -- 부서 정보
  name text NOT NULL,                    -- 부서명 (예: "개나리부", "마스터부")
  description text,                      -- 부서 설명 (예: "일반 동호인 대상")
  
  -- 일정 정보
  date_start date NOT NULL,              -- 해당 부서의 경기 시작 날짜
  date_end date,                         -- 해당 부서의 경기 종료 날짜 (선택)
  time_start time,                       -- 경기 시작 시간 (예: 09:00)
  
  -- 참가 정보
  capacity integer DEFAULT 32,           -- 모집 팀 수
  current_participants integer DEFAULT 0, -- 현재 참가 팀 수
  fee integer DEFAULT 0,                 -- 참가비 (정수형, 원 단위)
  
  -- 접수 기간
  registration_start_date date,          -- 접수 시작일
  registration_end_date date,            -- 접수 종료일
  
  -- 상태
  status text DEFAULT 'recruiting',      -- 'recruiting', 'closed', 'cancelled'
  
  -- 메타
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- [2] tournaments (부모 테이블) 컬럼 정리
-- ==========================================
DO $$
BEGIN
  -- location_city (지역) 필수화
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournaments' AND column_name = 'location_city'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN location_city text;
    RAISE NOTICE '✅ location_city 컬럼 추가';
  END IF;

  -- date_start (전체 대회 시작일) - 기존 date 활용
  -- date는 이미 존재하므로 그대로 사용
  RAISE NOTICE 'ℹ️  date 컬럼을 date_start로 사용 (별도 rename 생략)';

  -- date_end (전체 대회 종료일)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournaments' AND column_name = 'date_end'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN date_end date;
    RAISE NOTICE '✅ date_end 컬럼 추가';
  END IF;

  -- registration_start_date (전체 대회 접수 시작일)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournaments' AND column_name = 'registration_start_date'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN registration_start_date date;
    RAISE NOTICE '✅ registration_start_date 컬럼 추가';
  END IF;

  -- registration_end_date (전체 대회 접수 종료일)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournaments' AND column_name = 'registration_end_date'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN registration_end_date date;
    RAISE NOTICE '✅ registration_end_date 컬럼 추가';
  END IF;

  -- organizer (주최자)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournaments' AND column_name = 'organizer'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN organizer text DEFAULT 'KATO';
    RAISE NOTICE '✅ organizer 컬럼 추가';
  END IF;

  -- crawled_url (크롤링한 원본 URL)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournaments' AND column_name = 'crawled_url'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN crawled_url text;
    RAISE NOTICE '✅ crawled_url 컬럼 추가';
  END IF;
END $$;

-- [3] 인덱스 추가 (성능 최적화)
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_tournament_divisions_tournament_id 
  ON tournament_divisions(tournament_id);

CREATE INDEX IF NOT EXISTS idx_tournament_divisions_status 
  ON tournament_divisions(status);

CREATE INDEX IF NOT EXISTS idx_tournament_divisions_date_start 
  ON tournament_divisions(date_start);

CREATE INDEX IF NOT EXISTS idx_tournaments_location_city 
  ON tournaments(location_city);

CREATE INDEX IF NOT EXISTS idx_tournaments_registration_dates 
  ON tournaments(registration_start_date, registration_end_date);

-- [4] RLS (Row Level Security) 정책 설정
-- ==========================================
ALTER TABLE tournament_divisions ENABLE ROW LEVEL SECURITY;

-- 모든 사용자 읽기 허용
DROP POLICY IF EXISTS "Anyone can view divisions" ON tournament_divisions;
CREATE POLICY "Anyone can view divisions" 
  ON tournament_divisions FOR SELECT 
  USING (true);

-- 인증된 사용자만 INSERT/UPDATE/DELETE
DROP POLICY IF EXISTS "Authenticated users can manage divisions" ON tournament_divisions;
CREATE POLICY "Authenticated users can manage divisions" 
  ON tournament_divisions FOR ALL 
  USING (auth.role() = 'authenticated');

-- [5] 자동 업데이트 트리거 (updated_at)
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_tournament_divisions_updated_at ON tournament_divisions;
CREATE TRIGGER update_tournament_divisions_updated_at 
  BEFORE UPDATE ON tournament_divisions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- [6] 함수: 전체 대회 상태 자동 계산
-- ==========================================
-- 자식 divisions 중 하나라도 recruiting이면 부모도 recruiting
CREATE OR REPLACE FUNCTION sync_tournament_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tournaments
  SET status = CASE
    WHEN EXISTS (
      SELECT 1 FROM tournament_divisions 
      WHERE tournament_id = NEW.tournament_id 
      AND status = 'recruiting'
    ) THEN 'recruiting'
    ELSE 'closed'
  END
  WHERE id = NEW.tournament_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_tournament_status_trigger ON tournament_divisions;
CREATE TRIGGER sync_tournament_status_trigger
  AFTER INSERT OR UPDATE OF status ON tournament_divisions
  FOR EACH ROW
  EXECUTE FUNCTION sync_tournament_status();

-- [7] 함수: 전체 대회 날짜 자동 계산
-- ==========================================
-- 자식 divisions 중 가장 빠른 날짜를 부모의 date_start로 설정
CREATE OR REPLACE FUNCTION sync_tournament_dates()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tournaments
  SET 
    date = (
      SELECT MIN(date_start) 
      FROM tournament_divisions 
      WHERE tournament_id = NEW.tournament_id
    ),
    date_end = (
      SELECT MAX(COALESCE(date_end, date_start))
      FROM tournament_divisions 
      WHERE tournament_id = NEW.tournament_id
    )
  WHERE id = NEW.tournament_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_tournament_dates_trigger ON tournament_divisions;
CREATE TRIGGER sync_tournament_dates_trigger
  AFTER INSERT OR UPDATE OF date_start, date_end ON tournament_divisions
  FOR EACH ROW
  EXECUTE FUNCTION sync_tournament_dates();

-- [8] 함수: 대표 참가비 자동 계산 (최소 금액)
-- ==========================================
CREATE OR REPLACE FUNCTION sync_tournament_fee()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tournaments
  SET fee = (
    SELECT MIN(fee) 
    FROM tournament_divisions 
    WHERE tournament_id = NEW.tournament_id
    AND fee > 0
  )
  WHERE id = NEW.tournament_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_tournament_fee_trigger ON tournament_divisions;
CREATE TRIGGER sync_tournament_fee_trigger
  AFTER INSERT OR UPDATE OF fee ON tournament_divisions
  FOR EACH ROW
  EXECUTE FUNCTION sync_tournament_fee();

-- ==========================================
-- 완료 메시지
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE '✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨';
  RAISE NOTICE '🎉 DB 스키마 재설계 완료!';
  RAISE NOTICE '📊 tournament_divisions 테이블 생성 (1:N 구조)';
  RAISE NOTICE '🔧 자동 동기화 트리거 설정 (status, date, fee)';
  RAISE NOTICE '🔒 RLS 정책 적용';
  RAISE NOTICE '⚡ 인덱스 최적화 완료';
  RAISE NOTICE '✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨';
END $$;

-- ==========================================
-- 예시 데이터 (테스트용)
-- ==========================================
/*
-- 1. 부모 대회 등록
INSERT INTO tournaments (
  title,
  location,
  location_city,
  location_detail,
  organizer,
  thumbnail_url,
  crawled_url,
  status
) VALUES (
  '제5회 Kim''s 전국동호인테니스대회',
  '경북',
  '경북',
  '경북대학교 테니스장',
  'KATO',
  '/images/kato-groupa.png',
  'https://kato.kr/openGame/12345',
  'recruiting'
) RETURNING id;

-- 2. 자식 부서 등록 (예: 위에서 생성된 id 사용)
INSERT INTO tournament_divisions (
  tournament_id,
  name,
  date_start,
  date_end,
  time_start,
  capacity,
  fee,
  registration_start_date,
  registration_end_date,
  status
) VALUES 
(
  '00000000-0000-0000-0000-000000000001', -- 부모 tournament id
  '개나리부',
  '2026-03-07',
  '2026-03-07',
  '09:00',
  32,
  54000,
  '2026-02-01',
  '2026-02-28',
  'recruiting'
),
(
  '00000000-0000-0000-0000-000000000001',
  '국화부',
  '2026-03-08',
  '2026-03-08',
  '09:00',
  32,
  54000,
  '2026-02-01',
  '2026-02-28',
  'recruiting'
);

-- 3. 자동 동기화 확인
-- tournaments 테이블의 date, fee, status가 자동으로 업데이트됩니다!
SELECT * FROM tournaments WHERE title LIKE '%Kim%';
SELECT * FROM tournament_divisions WHERE tournament_id IN (
  SELECT id FROM tournaments WHERE title LIKE '%Kim%'
);
*/
