-- ==========================================
-- 치다 프로젝트 DB 빠른 복구 스크립트
-- ==========================================
-- Supabase SQL Editor에서 "Run" 버튼으로 실행
-- ==========================================

-- [1] tournaments 테이블 필수 컬럼 추가
DO $$ 
BEGIN
  -- category 컬럼
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'category') THEN
    ALTER TABLE tournaments ADD COLUMN category text NOT NULL DEFAULT '일반';
    RAISE NOTICE '✅ category 컬럼 추가됨';
  END IF;
  
  -- registration_link 컬럼
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'registration_link') THEN
    ALTER TABLE tournaments ADD COLUMN registration_link text;
    RAISE NOTICE '✅ registration_link 컬럼 추가됨';
  END IF;
  
  -- view_count 컬럼
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'view_count') THEN
    ALTER TABLE tournaments ADD COLUMN view_count bigint DEFAULT 0;
    RAISE NOTICE '✅ view_count 컬럼 추가됨';
  END IF;
  
  -- max_participants 컬럼
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'max_participants') THEN
    ALTER TABLE tournaments ADD COLUMN max_participants integer;
    RAISE NOTICE '✅ max_participants 컬럼 추가됨';
  END IF;
  
  -- current_participants 컬럼
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'current_participants') THEN
    ALTER TABLE tournaments ADD COLUMN current_participants integer DEFAULT 0;
    RAISE NOTICE '✅ current_participants 컬럼 추가됨';
  END IF;
  
  -- thumbnail_url 컬럼
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'thumbnail_url') THEN
    ALTER TABLE tournaments ADD COLUMN thumbnail_url text;
    RAISE NOTICE '✅ thumbnail_url 컬럼 추가됨';
  END IF;
  
  RAISE NOTICE '🎉 필수 컬럼 체크 완료!';
END $$;

-- [2] RLS 정책 재설정
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON tournaments;
CREATE POLICY "Enable read access for all users"
ON tournaments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert tournaments" ON tournaments;
CREATE POLICY "Authenticated users can insert tournaments"
ON tournaments FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update tournaments" ON tournaments;
CREATE POLICY "Authenticated users can update tournaments"
ON tournaments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete tournaments" ON tournaments;
CREATE POLICY "Authenticated users can delete tournaments"
ON tournaments FOR DELETE TO authenticated USING (true);

-- [3] 조회수 증가 함수
DROP FUNCTION IF EXISTS increment_view_count(uuid);
CREATE FUNCTION increment_view_count(row_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE tournaments SET view_count = view_count + 1 WHERE id = row_id;
END;
$$ LANGUAGE plpgsql;

-- [4] 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_tournaments_date ON tournaments(date);
CREATE INDEX IF NOT EXISTS idx_tournaments_category ON tournaments(category);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_created_at ON tournaments(created_at DESC);

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨';
  RAISE NOTICE '✅ DB 복구 완료!';
  RAISE NOTICE '📊 웹사이트를 테스트하세요: npm run dev';
  RAISE NOTICE '✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨';
END $$;
