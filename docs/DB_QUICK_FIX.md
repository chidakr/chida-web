# 🚨 치다 프로젝트 DB 긴급 복구 가이드

크롤러 작업이나 기타 이유로 DB가 꼬였을 때 빠르게 정상화하는 방법입니다.

---

## 📋 Step 1: 문제 확인

### 1-1. Supabase 대시보드 접속
```
https://supabase.com/dashboard
→ 프로젝트 선택: svtiekomuabusuuukwta
→ SQL Editor 메뉴 클릭
```

### 1-2. 현재 테이블 상태 확인
```sql
-- 모든 테이블 목록 확인
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

**정상적인 경우 다음 테이블들이 있어야 함:**
- ✅ `tournaments` (대회 정보)
- ✅ `participants` (참가자)
- ✅ `bookmarks` (북마크)
- ✅ `profiles` (사용자 프로필)

---

## 🔧 Step 2: 빠른 정상화

### 방법 1: 자동 정상화 스크립트 실행 (추천)

1. **`docs/DB_CHECK_AND_FIX.sql`** 파일 열기
2. 전체 내용 복사
3. Supabase SQL Editor에 붙여넣기
4. **Run** 버튼 클릭

> 이 스크립트는:
> - 테이블이 없으면 생성
> - RLS 정책 재설정
> - 인덱스 생성
> - 유틸리티 함수 생성

### 방법 2: 수동 체크 및 수정

#### 2-1. tournaments 테이블 확인
```sql
SELECT * FROM tournaments LIMIT 5;
```

**오류가 나면:**
```sql
-- tournaments 테이블 재생성
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
```

#### 2-2. RLS 정책 재설정
```sql
-- tournaments 테이블 RLS 활성화
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

-- 읽기 정책
CREATE POLICY "Enable read access for all users"
ON tournaments FOR SELECT
USING (true);

-- 쓰기 정책 (관리자용)
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
```

---

## ✅ Step 3: 정상화 확인

### 3-1. 웹사이트 테스트
```bash
npm run dev
```

1. `http://localhost:3000` 접속
2. 대회 리스트 페이지 확인: `http://localhost:3000/tournaments`
3. 에러 없이 로드되는지 확인

### 3-2. DB 데이터 확인
```sql
-- 대회 개수 확인
SELECT COUNT(*) FROM tournaments;

-- 최근 대회 5개 확인
SELECT id, title, date, status FROM tournaments ORDER BY created_at DESC LIMIT 5;
```

---

## 🚨 자주 발생하는 문제

### 문제 1: "relation tournaments does not exist"
**원인**: 테이블이 삭제됨  
**해결**: 위의 `CREATE TABLE` 스크립트 실행

### 문제 2: "permission denied for table tournaments"
**원인**: RLS 정책 문제  
**해결**: RLS 정책 재설정 스크립트 실행

### 문제 3: 데이터가 전부 사라짐
**원인**: DROP TABLE 실행됨  
**해결**: 
1. Supabase 대시보드 > Database > Backups 확인
2. 최근 백업으로 복구
3. 또는 `docs/KATO_DATA_INSERT.sql`로 샘플 데이터 재입력

### 문제 4: 크롤러가 DB를 계속 덮어씀
**원인**: 크롤러 스크립트가 `TRUNCATE` 또는 `DELETE` 실행  
**해결**:
1. 크롤러 스크립트 확인
2. `INSERT ... ON CONFLICT DO NOTHING` 또는 `UPSERT` 사용
3. 별도의 staging 테이블 사용 고려

---

## 📞 추가 도움

1. **Supabase 로그 확인**
   ```
   Dashboard > Logs > Query Logs
   ```

2. **DB 스키마 전체 확인**
   ```sql
   SELECT 
     table_name,
     column_name,
     data_type
   FROM information_schema.columns
   WHERE table_schema = 'public'
   ORDER BY table_name, ordinal_position;
   ```

3. **긴급 연락**
   - Supabase Support: https://supabase.com/support
   - 프로젝트 관리자에게 문의

---

## 💾 예방책

1. **정기 백업 설정**
   - Supabase 대시보드 > Settings > Database > Backups
   - 자동 백업 활성화 (Pro 플랜 이상)

2. **크롤러는 별도 테이블 사용**
   ```sql
   CREATE TABLE tournaments_staging (
     -- 크롤링한 데이터를 여기에 먼저 넣고
     -- 검증 후 tournaments로 이동
   );
   ```

3. **RLS 정책 백업**
   - `docs/DB_CHECK_AND_FIX.sql` 파일 항상 최신 상태 유지

---

**마지막 업데이트**: 2026-01-29
