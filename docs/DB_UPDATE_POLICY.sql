-- ==========================================
-- DB 수정 권한 설정 (Supabase 쿼리 에디터에서 실행)
-- ==========================================

-- 1. tournaments 테이블 수정 권한
-- 현재 문제: 일반 사용자가 update 불가
-- 해결: 인증된 사용자가 자신의 게시글을 수정할 수 있도록 설정

-- tournaments 테이블 UPDATE 정책 생성
CREATE POLICY "Authenticated users can update their own tournaments"
ON tournaments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)  -- user_id 컬럼이 있다면
WITH CHECK (auth.uid() = user_id);

-- 만약 user_id 컬럼이 없다면, 모든 인증된 사용자가 수정 가능하도록 설정
-- (관리자만 사용한다는 가정)
CREATE POLICY "Authenticated users can update tournaments"
ON tournaments
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 2. tournaments 테이블 INSERT 정책 (이미 있을 수도 있음)
CREATE POLICY "Authenticated users can insert tournaments"
ON tournaments
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 3. tournaments 테이블 DELETE 정책
CREATE POLICY "Authenticated users can delete tournaments"
ON tournaments
FOR DELETE
TO authenticated
USING (true);

-- 4. 현재 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'tournaments';

-- ==========================================
-- 참고: RLS(Row Level Security) 활성화 여부 확인
-- ==========================================
-- RLS가 비활성화되어 있으면 정책이 적용되지 않음
-- Supabase 대시보드 > Database > Tables > tournaments > RLS 확인

-- RLS 활성화 (필요 시)
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 사용 예시
-- ==========================================
-- admin/write 페이지에서 수정할 때:
-- await supabase.from('tournaments').update(payload).eq('id', editId)
-- 
-- 이 쿼리가 실행되면 위에서 만든 정책에 따라 권한 체크
