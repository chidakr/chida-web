-- ==========================================
-- 🌐 DB FLEXIBLE UPGRADE (범용성 강화)
-- ==========================================
-- 목적: KATO 대회뿐만 아니라 동네 소규모 대회부터 메이저 대회까지 모두 커버
-- 철학: "복잡한 대회도 담을 수 있고, 단순한 대회도 에러 없이 등록 가능"
-- 작성일: 2026-01-31
-- ==========================================

-- ==========================================
-- [1] tournaments 테이블 - 유연성 강화
-- ==========================================
-- 필수 필드: id, title, date, status
-- 선택 필드: 나머지 모든 필드 (Nullable)
-- ==========================================
DO $$
BEGIN
  -- 메타데이터 (JSONB) - 예측 불가능한 데이터 저장
  -- 예: {"parking": "무료 주차 가능", "meal": "점심 제공", "live_stream": "YouTube 링크"}
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tournaments' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;
    RAISE NOTICE '✅ metadata 컬럼 추가 완료 (JSONB - 유연한 데이터 저장)';
  END IF;

  -- 🌋 이미 추가된 필드들 확인 및 재설정 (Nullable 보장)
  -- host, sponsor, game_ball, refund_policy는 이미 CATACLYSM UPGRADE에서 추가됨
  RAISE NOTICE 'ℹ️  기존 필드(host, sponsor, game_ball, refund_policy)는 이미 Nullable 상태';
END $$;

-- ==========================================
-- [2] tournament_divisions 테이블 - 유연성 강화
-- ==========================================
-- 필수 필드: id, tournament_id, name, date_start, capacity, fee, status
-- 선택 필드: location, account_*, time_start, date_end, description 등
-- ==========================================
DO $$
BEGIN
  -- 메타데이터 (JSONB) - 부서별 특수 규정 저장
  -- 예: {"age_limit": "만 40세 이상", "skill_level": "NTRP 3.0 이상"}
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tournament_divisions' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE tournament_divisions ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;
    RAISE NOTICE '✅ tournament_divisions.metadata 컬럼 추가 완료 (JSONB)';
  END IF;

  -- 🌋 이미 추가된 필드들 (account_bank, account_number, account_owner, location)
  -- CATACLYSM UPGRADE에서 추가되었으며 모두 Nullable
  RAISE NOTICE 'ℹ️  부서별 계좌/장소 필드는 이미 Nullable 상태 (선택 필드)';
END $$;

-- ==========================================
-- [3] 인덱스 추가 (JSONB 검색 최적화)
-- ==========================================
-- JSONB 필드의 특정 키로 검색할 수 있도록 GIN 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_tournaments_metadata
  ON tournaments USING gin(metadata);

CREATE INDEX IF NOT EXISTS idx_tournament_divisions_metadata
  ON tournament_divisions USING gin(metadata);

-- ==========================================
-- [4] 기본값 설정 함수 (Helper)
-- ==========================================
-- 부서 정보가 없을 때 부모 tournament 정보를 사용하는 뷰
CREATE OR REPLACE VIEW tournament_divisions_with_defaults AS
SELECT
  d.id,
  d.tournament_id,
  d.name,
  d.date_start,
  d.date_end,
  d.time_start,
  COALESCE(d.location, t.location_detail, t.location) AS location,  -- 🔥 부서 장소 > 상세 주소 > 지역
  d.capacity,
  d.current_participants,
  d.fee,
  COALESCE(d.account_bank, '') AS account_bank,       -- 🔥 없으면 빈 문자열
  COALESCE(d.account_number, '') AS account_number,
  COALESCE(d.account_owner, '') AS account_owner,
  d.registration_start_date,
  d.registration_end_date,
  d.status,
  d.description,
  d.metadata,
  d.created_at,
  d.updated_at,
  -- 🔥 부모 tournament 정보도 함께 (JOIN 용도)
  t.title AS tournament_title,
  t.host AS tournament_host,
  t.sponsor AS tournament_sponsor,
  t.game_ball AS tournament_game_ball,
  t.refund_policy AS tournament_refund_policy
FROM tournament_divisions d
JOIN tournaments t ON d.tournament_id = t.id;

-- ==========================================
-- [5] 데이터 검증 함수 업데이트
-- ==========================================
-- 기존 validate_division_data 함수 수정 (경고만, 에러 안냄)
CREATE OR REPLACE FUNCTION validate_division_data()
RETURNS TRIGGER AS $$
BEGIN
  -- 참가비가 있는 부서는 계좌 정보 권장 (경고만)
  IF NEW.fee > 0 AND (
    NEW.account_bank IS NULL OR
    NEW.account_number IS NULL OR
    NEW.account_owner IS NULL
  ) THEN
    RAISE NOTICE '💡 권장사항: 부서 "%"에 참가비(% 원)가 설정되었지만 계좌 정보가 없습니다.', NEW.name, NEW.fee;
    RAISE NOTICE '   계좌 정보를 입력하면 사용자 경험이 개선됩니다.';
  END IF;

  -- 장소 정보 없을 때 알림
  IF NEW.location IS NULL OR NEW.location = '' THEN
    RAISE NOTICE '💡 권장사항: 부서 "%"에 장소 정보가 없습니다. 부모 tournament의 location이 사용됩니다.', NEW.name;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 재생성
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
  RAISE NOTICE '🌐🌐🌐🌐🌐🌐🌐🌐🌐🌐🌐🌐🌐🌐🌐🌐';
  RAISE NOTICE '🎉 DB FLEXIBLE UPGRADE 완료!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ 범용성 강화 완료:';
  RAISE NOTICE '   - tournaments.metadata (JSONB)';
  RAISE NOTICE '   - tournament_divisions.metadata (JSONB)';
  RAISE NOTICE '   - 모든 상세 필드 Nullable 보장';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '📊 필수 필드 (NOT NULL):';
  RAISE NOTICE '   tournaments: id, title, date, status';
  RAISE NOTICE '   divisions: id, tournament_id, name, date_start, fee, capacity, status';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '📊 선택 필드 (Nullable):';
  RAISE NOTICE '   - 계좌 정보 (account_bank, account_number, account_owner)';
  RAISE NOTICE '   - 장소 정보 (location, location_detail)';
  RAISE NOTICE '   - 메타 정보 (host, sponsor, game_ball, refund_policy)';
  RAISE NOTICE '   - 기타 모든 필드';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '💡 사용 예시:';
  RAISE NOTICE '   - KATO 대회: 모든 필드 채워서 고밀도 정보 제공';
  RAISE NOTICE '   - 동네 대회: 필수 필드만 채우고 나머지 NULL';
  RAISE NOTICE '   - 특수 규정: metadata JSONB에 자유롭게 저장';
  RAISE NOTICE '🌐🌐🌐🌐🌐🌐🌐🌐🌐🌐🌐🌐🌐🌐🌐🌐';
END $$;

-- ==========================================
-- 예시 데이터
-- ==========================================
/*
-- 1. KATO 대회 (고밀도 정보)
INSERT INTO tournaments (
  title, date, status,
  host, sponsor, game_ball, refund_policy,
  location_city, location_detail,
  metadata
) VALUES (
  '제5회 Kim''s 전국동호인테니스대회',
  '2026-03-07',
  'recruiting',
  'Kim''s Tennis, (사)한국테니스발전협의회',
  '경상북도테니스협회, 대구광역시북구테니스협회',
  '낫소 짜르투어테니스볼',
  '2026년 2월 27일(금) 15시 마감. 이후 환불불가',
  '대구',
  '경북대학교 테니스장',
  '{"parking": "무료 주차 가능", "live_stream": "YouTube 실시간 중계"}'::jsonb
);

-- 2. 동네 대회 (최소 정보만)
INSERT INTO tournaments (
  title, date, status, location_city
) VALUES (
  '마포구청장배 동네 테니스대회',
  '2026-04-15',
  'recruiting',
  '서울'
);

-- 3. 부서 정보 (계좌 있는 경우)
INSERT INTO tournament_divisions (
  tournament_id, name, date_start, fee, capacity,
  account_bank, account_number, account_owner,
  metadata
) VALUES (
  '<tournament_id>',
  '개나리부',
  '2026-03-07',
  54000,
  32,
  '국민은행',
  '028202-04-083663',
  '김경섭',
  '{"age_limit": "만 18세 이상", "skill_level": "초급"}'::jsonb
);

-- 4. 부서 정보 (계좌 없는 경우 - 동네 대회)
INSERT INTO tournament_divisions (
  tournament_id, name, date_start, fee, capacity,
  metadata
) VALUES (
  '<tournament_id>',
  '일반부',
  '2026-04-15',
  30000,
  16,
  '{"note": "현장 접수 가능"}'::jsonb
);
*/
