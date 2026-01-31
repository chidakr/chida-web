-- ==========================================
-- 크롤러 안전 설정 (DB 보호)
-- ==========================================
-- 목적: 크롤러 작업 중 프로덕션 DB 보호
-- ==========================================

-- [1] Staging 테이블 생성 (크롤러 전용)
-- 크롤링한 데이터를 여기에 먼저 저장
DROP TABLE IF EXISTS tournaments_staging CASCADE;

CREATE TABLE tournaments_staging (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  date date NOT NULL,
  location text NOT NULL,
  category text NOT NULL,
  max_participants integer,
  current_participants integer DEFAULT 0,
  status text DEFAULT 'recruiting',
  thumbnail_url text,
  registration_link text,
  view_count bigint DEFAULT 0,
  
  -- 크롤링 메타데이터
  source_url text, -- 크롤링한 원본 URL
  crawled_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  is_verified boolean DEFAULT false, -- 검증 완료 여부
  
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- [2] Staging 테이블 인덱스
CREATE INDEX idx_staging_date ON tournaments_staging(date);
CREATE INDEX idx_staging_verified ON tournaments_staging(is_verified);
CREATE INDEX idx_staging_crawled_at ON tournaments_staging(crawled_at);

-- [3] Staging 테이블 RLS 설정 (관리자만 접근)
ALTER TABLE tournaments_staging ENABLE ROW LEVEL SECURITY;

-- 인증된 사용자만 읽기
CREATE POLICY "Authenticated can read staging"
ON tournaments_staging FOR SELECT
TO authenticated
USING (true);

-- 인증된 사용자만 쓰기
CREATE POLICY "Authenticated can write staging"
ON tournaments_staging FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- [4] 검증 함수 (데이터 유효성 검사)
CREATE OR REPLACE FUNCTION validate_tournament_data(
  p_title text,
  p_date date,
  p_location text,
  p_status text
)
RETURNS boolean AS $$
BEGIN
  -- 제목 검증
  IF p_title IS NULL OR LENGTH(TRIM(p_title)) < 3 THEN
    RAISE NOTICE '❌ 제목이 너무 짧습니다: %', p_title;
    RETURN false;
  END IF;
  
  -- 날짜 검증 (너무 과거나 미래가 아닌지)
  IF p_date < CURRENT_DATE - INTERVAL '1 year' THEN
    RAISE NOTICE '❌ 날짜가 너무 과거입니다: %', p_date;
    RETURN false;
  END IF;
  
  IF p_date > CURRENT_DATE + INTERVAL '2 years' THEN
    RAISE NOTICE '❌ 날짜가 너무 미래입니다: %', p_date;
    RETURN false;
  END IF;
  
  -- 지역 검증
  IF p_location IS NULL OR LENGTH(TRIM(p_location)) = 0 THEN
    RAISE NOTICE '❌ 지역이 비어있습니다';
    RETURN false;
  END IF;
  
  -- 상태 검증
  IF p_status NOT IN ('recruiting', 'closed') THEN
    RAISE NOTICE '❌ 잘못된 상태값: %', p_status;
    RETURN false;
  END IF;
  
  RAISE NOTICE '✅ 검증 통과: %', p_title;
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- [5] 안전한 이관 함수 (Staging → Production)
CREATE OR REPLACE FUNCTION migrate_verified_tournaments()
RETURNS TABLE(
  total_count integer,
  success_count integer,
  failed_count integer
) AS $$
DECLARE
  v_total integer := 0;
  v_success integer := 0;
  v_failed integer := 0;
  v_record RECORD;
BEGIN
  -- 검증된 데이터만 이관
  FOR v_record IN 
    SELECT * FROM tournaments_staging 
    WHERE is_verified = true
    ORDER BY crawled_at
  LOOP
    v_total := v_total + 1;
    
    -- 데이터 재검증
    IF validate_tournament_data(
      v_record.title,
      v_record.date,
      v_record.location,
      v_record.status
    ) THEN
      -- 프로덕션 테이블에 UPSERT
      INSERT INTO tournaments (
        title, description, date, location, category,
        max_participants, current_participants, status,
        thumbnail_url, registration_link, view_count
      ) VALUES (
        v_record.title,
        v_record.description,
        v_record.date,
        v_record.location,
        v_record.category,
        v_record.max_participants,
        v_record.current_participants,
        v_record.status,
        v_record.thumbnail_url,
        v_record.registration_link,
        v_record.view_count
      )
      ON CONFLICT (id) 
      DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        date = EXCLUDED.date,
        location = EXCLUDED.location,
        updated_at = timezone('utc'::text, now());
      
      v_success := v_success + 1;
      
      -- Staging에서 삭제
      DELETE FROM tournaments_staging WHERE id = v_record.id;
    ELSE
      v_failed := v_failed + 1;
    END IF;
  END LOOP;
  
  RAISE NOTICE '📊 이관 완료: 전체 %, 성공 %, 실패 %', v_total, v_success, v_failed;
  
  RETURN QUERY SELECT v_total, v_success, v_failed;
END;
$$ LANGUAGE plpgsql;

-- [6] 크롤러 로그 테이블 (디버깅용)
CREATE TABLE IF NOT EXISTS crawler_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  operation text NOT NULL, -- 'insert', 'update', 'delete', 'error'
  message text,
  data jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_crawler_logs_created_at ON crawler_logs(created_at DESC);
CREATE INDEX idx_crawler_logs_operation ON crawler_logs(operation);

-- 자동 정리: 30일 이상 된 로그 삭제
CREATE OR REPLACE FUNCTION cleanup_old_crawler_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM crawler_logs 
  WHERE created_at < CURRENT_DATE - INTERVAL '30 days';
  
  RAISE NOTICE '🧹 오래된 크롤러 로그 정리 완료';
END;
$$ LANGUAGE plpgsql;

-- [7] 긴급 복구 함수 (백업 테이블 생성)
CREATE OR REPLACE FUNCTION backup_tournaments()
RETURNS void AS $$
BEGIN
  -- 기존 백업 삭제
  DROP TABLE IF EXISTS tournaments_backup;
  
  -- 현재 tournaments 테이블 백업
  CREATE TABLE tournaments_backup AS 
  SELECT * FROM tournaments;
  
  RAISE NOTICE '💾 백업 완료: % 개 대회', (SELECT COUNT(*) FROM tournaments_backup);
END;
$$ LANGUAGE plpgsql;

-- [8] 복구 함수
CREATE OR REPLACE FUNCTION restore_tournaments()
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tournaments_backup') THEN
    RAISE EXCEPTION '❌ 백업 테이블이 없습니다!';
  END IF;
  
  -- 현재 데이터 삭제
  TRUNCATE tournaments CASCADE;
  
  -- 백업에서 복구
  INSERT INTO tournaments
  SELECT * FROM tournaments_backup;
  
  RAISE NOTICE '♻️ 복구 완료: % 개 대회', (SELECT COUNT(*) FROM tournaments);
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 사용 가이드
-- ==========================================

/*
[크롤러 작업 순서]

1. 백업 생성
   SELECT backup_tournaments();

2. Staging 테이블 초기화
   TRUNCATE tournaments_staging;

3. 크롤러 실행 → tournaments_staging에 데이터 저장

4. 데이터 검증
   UPDATE tournaments_staging 
   SET is_verified = true 
   WHERE validate_tournament_data(title, date, location, status);

5. 검증된 데이터 확인
   SELECT * FROM tournaments_staging WHERE is_verified = true;

6. 프로덕션으로 이관
   SELECT * FROM migrate_verified_tournaments();

7. 문제 발생 시 복구
   SELECT restore_tournaments();

[유용한 쿼리]

-- Staging 데이터 통계
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_verified = true) as verified,
  COUNT(*) FILTER (WHERE is_verified = false) as unverified
FROM tournaments_staging;

-- 최근 크롤러 로그 확인
SELECT * FROM crawler_logs 
ORDER BY created_at DESC 
LIMIT 20;

-- 백업 존재 확인
SELECT 
  'tournaments_backup' as table_name,
  COUNT(*) as row_count
FROM tournaments_backup;
*/

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨';
  RAISE NOTICE '🛡️ 크롤러 안전 설정 완료!';
  RAISE NOTICE '📋 사용법: SQL 파일 하단 주석 참고';
  RAISE NOTICE '✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨';
END $$;
