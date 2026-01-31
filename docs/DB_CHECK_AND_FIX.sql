-- ==========================================
-- 치다 프로젝트 DB 상태 체크 & 정상화 스크립트
-- ==========================================
-- 사용법: Supabase 대시보드 > SQL Editor에서 실행
-- ==========================================

-- [1단계] 현재 DB 상태 체크
-- ==========================================

-- 1-1. tournaments 테이블 존재 여부 및 구조 확인
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'tournaments'
ORDER BY ordinal_position;

-- 1-2. participants 테이블 존재 여부 및 구조 확인
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'participants'
ORDER BY ordinal_position;

-- 1-3. bookmarks 테이블 존재 여부 및 구조 확인
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'bookmarks'
ORDER BY ordinal_position;

-- 1-4. profiles 테이블 존재 여부 및 구조 확인
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 1-5. RLS(Row Level Security) 상태 확인
SELECT 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('tournaments', 'participants', 'bookmarks', 'profiles');

-- 1-6. 현재 정책(Policy) 확인
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('tournaments', 'participants', 'bookmarks', 'profiles')
ORDER BY tablename, policyname;


-- ==========================================
-- [2단계] DB 정상화 (문제 발견 시 실행)
-- ==========================================

-- 2-1. tournaments 테이블 재생성 (테이블이 없거나 구조가 잘못된 경우)
-- 주의: 기존 데이터가 삭제될 수 있으니 백업 필요!
-- DROP TABLE IF EXISTS tournaments CASCADE;

CREATE TABLE IF NOT EXISTS tournaments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  date date NOT NULL,
  location text NOT NULL,
  category text NOT NULL,
  max_participants integer,
  current_participants integer DEFAULT 0,
  status text DEFAULT '모집중',
  thumbnail_url text,
  registration_link text,
  view_count bigint DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 2-1-1. tournaments 테이블에 누락된 컬럼 추가 (기존 테이블이 있는 경우)
-- category 컬럼 추가
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournaments' AND column_name = 'category'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN category text NOT NULL DEFAULT '일반';
  END IF;
END $$;

-- registration_link 컬럼 추가
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournaments' AND column_name = 'registration_link'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN registration_link text;
  END IF;
END $$;

-- view_count 컬럼 추가
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournaments' AND column_name = 'view_count'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN view_count bigint DEFAULT 0;
  END IF;
END $$;

-- max_participants 컬럼 추가
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournaments' AND column_name = 'max_participants'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN max_participants integer;
  END IF;
END $$;

-- current_participants 컬럼 추가
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournaments' AND column_name = 'current_participants'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN current_participants integer DEFAULT 0;
  END IF;
END $$;

-- thumbnail_url 컬럼 추가
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournaments' AND column_name = 'thumbnail_url'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN thumbnail_url text;
  END IF;
END $$;

-- 2-2. participants 테이블 재생성
CREATE TABLE IF NOT EXISTS participants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id uuid REFERENCES tournaments(id) ON DELETE CASCADE,
  team_name text NOT NULL,
  leader_name text NOT NULL,
  phone text NOT NULL,
  level text,
  status text DEFAULT '신청완료',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 2-3. bookmarks 테이블 재생성
CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  tournament_id uuid REFERENCES tournaments(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, tournament_id)
);

-- 2-4. profiles 테이블 재생성
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);


-- ==========================================
-- [3단계] RLS(Row Level Security) 설정
-- ==========================================

-- 3-1. tournaments 테이블 RLS 설정
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Enable read access for all users" ON tournaments;
DROP POLICY IF EXISTS "Authenticated users can insert tournaments" ON tournaments;
DROP POLICY IF EXISTS "Authenticated users can update tournaments" ON tournaments;
DROP POLICY IF EXISTS "Authenticated users can delete tournaments" ON tournaments;

-- 새 정책 생성
CREATE POLICY "Enable read access for all users"
ON tournaments FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert tournaments"
ON tournaments FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update tournaments"
ON tournaments FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete tournaments"
ON tournaments FOR DELETE
TO authenticated
USING (true);


-- 3-2. participants 테이블 RLS 설정
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "누구나 신청 가능" ON participants;
DROP POLICY IF EXISTS "관리자만 조회 가능 (현재는 전체 허용)" ON participants;

CREATE POLICY "Anyone can insert participants"
ON participants FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view participants"
ON participants FOR SELECT
USING (true);


-- 3-3. bookmarks 테이블 RLS 설정
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can insert own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON bookmarks;

CREATE POLICY "Users can view own bookmarks"
ON bookmarks FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks"
ON bookmarks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
ON bookmarks FOR DELETE
TO authenticated
USING (auth.uid() = user_id);


-- 3-4. profiles 테이블 RLS 설정
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);


-- ==========================================
-- [4단계] 유틸리티 함수 생성
-- ==========================================

-- 4-1. 조회수 증가 함수 (안전한 동시성 처리)
-- 기존 함수 삭제 후 재생성
DROP FUNCTION IF EXISTS increment_view_count(uuid);

CREATE FUNCTION increment_view_count(row_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE tournaments
  SET view_count = view_count + 1
  WHERE id = row_id;
END;
$$ LANGUAGE plpgsql;


-- ==========================================
-- [5단계] 인덱스 생성 (성능 최적화)
-- ==========================================

-- tournaments 테이블 인덱스 (컬럼이 있을 때만 생성)
DO $$ 
BEGIN
  -- date 인덱스
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'date') THEN
    CREATE INDEX IF NOT EXISTS idx_tournaments_date ON tournaments(date);
  END IF;
  
  -- category 인덱스
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'category') THEN
    CREATE INDEX IF NOT EXISTS idx_tournaments_category ON tournaments(category);
  END IF;
  
  -- status 인덱스
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'status') THEN
    CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
  END IF;
  
  -- created_at 인덱스
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'created_at') THEN
    CREATE INDEX IF NOT EXISTS idx_tournaments_created_at ON tournaments(created_at DESC);
  END IF;
END $$;

-- participants 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_participants_tournament_id ON participants(tournament_id);

-- bookmarks 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_tournament_id ON bookmarks(tournament_id);


-- ==========================================
-- [6단계] 완료 메시지
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '✅ DB 정상화 완료!';
  RAISE NOTICE '📊 다음 명령어로 상태를 확인하세요:';
  RAISE NOTICE '   SELECT * FROM pg_tables WHERE schemaname = ''public'';';
  RAISE NOTICE '   SELECT * FROM pg_policies;';
END $$;
