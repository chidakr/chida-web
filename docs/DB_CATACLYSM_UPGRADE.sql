-- ==========================================
-- 🌋 DB CATACLYSM UPGRADE
-- ==========================================
-- 목적: 프론트엔드 "대격변(Cataclysm)" 업데이트에 맞춰 DB 스키마 확장
-- 작성일: 2026-01-31
-- 변경 사항:
--   1. tournaments 테이블: host, sponsor, game_ball, refund_policy 추가
--   2. tournament_divisions 테이블: location, account_bank, account_number, account_owner 추가
-- ==========================================

-- ==========================================
-- [1] tournaments 테이블 확장 (메타 정보 추가)
-- ==========================================
DO $$
BEGIN
  -- 주관 (예: (사)한국테니스발전협의회)
  -- organizer는 "주최"로 이미 존재, host는 "주관"으로 구분
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tournaments' AND column_name = 'host'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN host text;
    RAISE NOTICE '✅ host 컬럼 추가 완료 (주관)';
  END IF;

  -- 후원사 (길게 들어갈 수 있음)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tournaments' AND column_name = 'sponsor'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN sponsor text;
    RAISE NOTICE '✅ sponsor 컬럼 추가 완료 (후원)';
  END IF;

  -- 사용구 (예: 낫소 짜르투어)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tournaments' AND column_name = 'game_ball'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN game_ball text;
    RAISE NOTICE '✅ game_ball 컬럼 추가 완료 (사용구)';
  END IF;

  -- 환불 규정 (텍스트로 길게)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tournaments' AND column_name = 'refund_policy'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN refund_policy text;
    RAISE NOTICE '✅ refund_policy 컬럼 추가 완료 (환불 규정)';
  END IF;
END $$;

-- ==========================================
-- [2] tournament_divisions 테이블 대대적 확장
-- ==========================================
-- 이제 각 부서(Division)마다 독립적인 장소, 계좌 정보를 가짐
-- ==========================================
DO $$
BEGIN
  -- 부서별 장소 (대표 장소와 다를 수 있음)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tournament_divisions' AND column_name = 'location'
  ) THEN
    ALTER TABLE tournament_divisions ADD COLUMN location text;
    RAISE NOTICE '✅ location 컬럼 추가 완료 (부서별 장소)';
  END IF;

  -- 은행명 (부서마다 입금 계좌가 다를 수 있음)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tournament_divisions' AND column_name = 'account_bank'
  ) THEN
    ALTER TABLE tournament_divisions ADD COLUMN account_bank text;
    RAISE NOTICE '✅ account_bank 컬럼 추가 완료 (은행명)';
  END IF;

  -- 계좌번호
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tournament_divisions' AND column_name = 'account_number'
  ) THEN
    ALTER TABLE tournament_divisions ADD COLUMN account_number text;
    RAISE NOTICE '✅ account_number 컬럼 추가 완료 (계좌번호)';
  END IF;

  -- 예금주
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tournament_divisions' AND column_name = 'account_owner'
  ) THEN
    ALTER TABLE tournament_divisions ADD COLUMN account_owner text;
    RAISE NOTICE '✅ account_owner 컬럼 추가 완료 (예금주)';
  END IF;
END $$;

-- ==========================================
-- [3] 인덱스 추가 (성능 최적화)
-- ==========================================
-- 부서별 계좌번호 검색 (관리자 페이지에서 필터링용)
CREATE INDEX IF NOT EXISTS idx_tournament_divisions_account
  ON tournament_divisions(account_bank, account_number);

-- 부서별 장소 검색
CREATE INDEX IF NOT EXISTS idx_tournament_divisions_location
  ON tournament_divisions(location);

-- ==========================================
-- [4] 데이터 검증 함수 (선택적)
-- ==========================================
-- 부서 데이터가 유효한지 체크하는 함수
CREATE OR REPLACE FUNCTION validate_division_data()
RETURNS TRIGGER AS $$
BEGIN
  -- 참가비가 있는 부서는 계좌 정보 필수
  IF NEW.fee > 0 AND (
    NEW.account_bank IS NULL OR
    NEW.account_number IS NULL OR
    NEW.account_owner IS NULL
  ) THEN
    RAISE WARNING '⚠️ 부서 "%": 참가비가 있는 경우 계좌 정보(은행명, 계좌번호, 예금주)를 입력해야 합니다.', NEW.name;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성 (경고만 출력, 에러는 발생시키지 않음)
DROP TRIGGER IF EXISTS validate_division_data_trigger ON tournament_divisions;
CREATE TRIGGER validate_division_data_trigger
  BEFORE INSERT OR UPDATE ON tournament_divisions
  FOR EACH ROW
  EXECUTE FUNCTION validate_division_data();

-- ==========================================
-- 완료 메시지
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE '🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋';
  RAISE NOTICE '🎉 DB CATACLYSM UPGRADE 완료!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '📊 tournaments 테이블 확장:';
  RAISE NOTICE '   - host (주관)';
  RAISE NOTICE '   - sponsor (후원)';
  RAISE NOTICE '   - game_ball (사용구)';
  RAISE NOTICE '   - refund_policy (환불 규정)';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '📊 tournament_divisions 테이블 확장:';
  RAISE NOTICE '   - location (부서별 장소)';
  RAISE NOTICE '   - account_bank (은행명)';
  RAISE NOTICE '   - account_number (계좌번호)';
  RAISE NOTICE '   - account_owner (예금주)';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '⚡ 인덱스 최적화 완료';
  RAISE NOTICE '✅ 데이터 검증 트리거 추가';
  RAISE NOTICE '🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 다음 단계:';
  RAISE NOTICE '   1. Supabase SQL Editor에서 이 스크립트 실행';
  RAISE NOTICE '   2. Python 크롤러 수정 (계좌 정보 파싱)';
  RAISE NOTICE '   3. 프론트엔드 테스트';
  RAISE NOTICE '';
END $$;

-- ==========================================
-- 예시 데이터 (테스트용)
-- ==========================================
/*
-- 1. 기존 대회 업데이트 (메타 정보 추가)
UPDATE tournaments
SET
  host = 'Kim''s Tennis, (사)한국테니스발전협의회',
  sponsor = '경상북도테니스협회, 대구광역시북구테니스협회, 포항시테니스협회, 청도군테니스협회',
  game_ball = '낫소 짜르투어테니스볼',
  refund_policy = '2026년 2월 27일(금) 15시 마감. 이후 환불불가'
WHERE title LIKE '%Kim%';

-- 2. 부서 정보 업데이트 (계좌 정보 추가)
UPDATE tournament_divisions
SET
  location = '경북대학교 테니스장',
  account_bank = '국민은행',
  account_number = '028202-04-083663',
  account_owner = '김경섭'
WHERE name = '개나리부';

UPDATE tournament_divisions
SET
  location = '경북대학교 테니스장',
  account_bank = '기업은행',
  account_number = '545-005715-01-026',
  account_owner = '김경섭'
WHERE name = '국화부';

-- 3. 확인
SELECT
  t.title,
  t.host,
  t.sponsor,
  t.game_ball,
  d.name as division,
  d.account_bank,
  d.account_number,
  d.account_owner
FROM tournaments t
JOIN tournament_divisions d ON t.id = d.tournament_id
WHERE t.title LIKE '%Kim%';
*/
