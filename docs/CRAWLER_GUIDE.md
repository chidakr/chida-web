# 🕷️ 치다 크롤러 안전 가이드

크롤러 작업 중 DB가 꼬이는 것을 방지하는 완벽한 가이드입니다.

---

## 🛡️ 핵심 원칙

> **절대 프로덕션 테이블(`tournaments`)에 직접 저장하지 마세요!**

대신:
1. **Staging 테이블**에 먼저 저장
2. **검증** 후
3. **안전하게 이관**

---

## 📋 설정 방법

### Step 1: 안전 환경 구축
```sql
-- docs/CRAWLER_SAFE_SETUP.sql 파일을 Supabase에서 실행
```

이 스크립트가 생성하는 것:
- ✅ `tournaments_staging` 테이블 (크롤러 전용)
- ✅ `validate_tournament_data()` 함수 (데이터 검증)
- ✅ `migrate_verified_tournaments()` 함수 (안전한 이관)
- ✅ `backup_tournaments()` 함수 (백업)
- ✅ `restore_tournaments()` 함수 (복구)
- ✅ `crawler_logs` 테이블 (디버깅)

---

## 🚀 크롤러 작업 워크플로우

### 작업 시작 전
```sql
-- 1. 백업 생성 (필수!)
SELECT backup_tournaments();

-- 2. Staging 테이블 초기화
TRUNCATE tournaments_staging;
```

### 크롤러 실행
```javascript
// 크롤러 코드에서 tournaments_staging에 저장
const { error } = await supabase
  .from('tournaments_staging') // ⚠️ staging 테이블!
  .insert({
    title: "크롤링한 대회명",
    date: "2026-02-15",
    location: "서울",
    category: "일반",
    status: "recruiting",
    thumbnail_url: "이미지URL",
    registration_link: "신청URL",
    source_url: "크롤링 원본 URL", // 디버깅용
  });
```

### 데이터 검증
```sql
-- 3. 자동 검증 실행
UPDATE tournaments_staging 
SET is_verified = validate_tournament_data(title, date, location, status)
WHERE is_verified = false;

-- 4. 검증 결과 확인
SELECT 
  COUNT(*) FILTER (WHERE is_verified = true) as 통과,
  COUNT(*) FILTER (WHERE is_verified = false) as 실패
FROM tournaments_staging;

-- 5. 실패한 데이터 확인
SELECT * FROM tournaments_staging WHERE is_verified = false;
```

### 프로덕션 이관
```sql
-- 6. 검증된 데이터만 안전하게 이관
SELECT * FROM migrate_verified_tournaments();

-- 결과 예시:
-- total_count | success_count | failed_count
--      50     |      45       |      5
```

### 문제 발생 시
```sql
-- 🚨 긴급 복구!
SELECT restore_tournaments();
```

---

## 📊 유용한 모니터링 쿼리

### 1. Staging 상태 확인
```sql
SELECT 
  COUNT(*) as 전체,
  COUNT(*) FILTER (WHERE is_verified = true) as 검증완료,
  COUNT(*) FILTER (WHERE is_verified = false) as 검증실패,
  MIN(crawled_at) as 최초크롤링,
  MAX(crawled_at) as 최근크롤링
FROM tournaments_staging;
```

### 2. 프로덕션 vs Staging 비교
```sql
SELECT 
  (SELECT COUNT(*) FROM tournaments) as 프로덕션,
  (SELECT COUNT(*) FROM tournaments_staging) as Staging,
  (SELECT COUNT(*) FROM tournaments_backup) as 백업
;
```

### 3. 최근 크롤러 로그
```sql
SELECT 
  operation,
  message,
  created_at
FROM crawler_logs 
ORDER BY created_at DESC 
LIMIT 10;
```

### 4. 중복 데이터 확인
```sql
-- Staging에서 중복 제목 찾기
SELECT 
  title,
  COUNT(*) as 중복수
FROM tournaments_staging
GROUP BY title
HAVING COUNT(*) > 1;
```

---

## 💡 크롤러 코드 예시

### JavaScript/TypeScript (Node.js)
```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Service Role Key 사용!
);

async function safeCrawl() {
  try {
    // 1. 백업 생성
    await supabase.rpc('backup_tournaments');
    console.log('✅ 백업 생성 완료');

    // 2. 크롤링 시작
    const tournaments = await crawlTournaments(); // 크롤링 로직
    
    // 3. Staging에 저장
    const { data, error } = await supabase
      .from('tournaments_staging')
      .insert(tournaments);

    if (error) throw error;
    console.log(`✅ ${tournaments.length}개 데이터 저장 완료`);

    // 4. 자동 검증
    const { data: verified } = await supabase
      .from('tournaments_staging')
      .select('*')
      .eq('is_verified', true);

    console.log(`✅ ${verified.length}개 검증 통과`);

    // 5. 이관 (수동으로 Supabase에서 실행)
    console.log('ℹ️  Supabase에서 migrate_verified_tournaments() 실행하세요');

  } catch (error) {
    console.error('❌ 크롤링 실패:', error);
    
    // 로그 기록
    await supabase.from('crawler_logs').insert({
      operation: 'error',
      message: error.message,
      data: { error: error.stack }
    });
  }
}

safeCrawl();
```

### Python
```python
from supabase import create_client
import os

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

def safe_crawl():
    try:
        # 1. 백업
        supabase.rpc('backup_tournaments').execute()
        print("✅ 백업 완료")

        # 2. 크롤링
        tournaments = crawl_tournaments()  # 크롤링 로직

        # 3. Staging에 저장
        result = supabase.table('tournaments_staging').insert(tournaments).execute()
        print(f"✅ {len(tournaments)}개 저장 완료")

        # 4. 검증
        verified = supabase.table('tournaments_staging') \
            .select('*') \
            .eq('is_verified', True) \
            .execute()
        
        print(f"✅ {len(verified.data)}개 검증 통과")

    except Exception as e:
        print(f"❌ 에러: {e}")
        
        # 로그 기록
        supabase.table('crawler_logs').insert({
            'operation': 'error',
            'message': str(e)
        }).execute()

safe_crawl()
```

---

## 🚨 트러블슈팅

### 문제 1: "relation tournaments_staging does not exist"
**해결**: `CRAWLER_SAFE_SETUP.sql` 스크립트 실행

### 문제 2: 검증이 전부 실패함
**원인**: 데이터 형식 문제
**해결**: Staging 데이터 확인 후 수동 수정
```sql
-- 검증 실패 원인 확인
SELECT 
  title,
  date,
  location,
  status,
  validate_tournament_data(title, date, location, status) as 검증결과
FROM tournaments_staging
WHERE is_verified = false
LIMIT 10;
```

### 문제 3: 이관 후 데이터가 이상함
**해결**: 즉시 복구
```sql
SELECT restore_tournaments();
```

### 문제 4: 크롤러가 너무 느림
**최적화**: 배치 처리
```javascript
// 1000개씩 나눠서 저장
const batchSize = 1000;
for (let i = 0; i < tournaments.length; i += batchSize) {
  const batch = tournaments.slice(i, i + batchSize);
  await supabase.from('tournaments_staging').insert(batch);
  console.log(`${i + batch.length} / ${tournaments.length} 완료`);
}
```

---

## ✅ 체크리스트

크롤러 실행 전:
- [ ] `CRAWLER_SAFE_SETUP.sql` 실행됨
- [ ] 백업 생성 (`backup_tournaments()`)
- [ ] Staging 테이블 비어있음 (`TRUNCATE`)
- [ ] Service Role Key 환경변수 설정됨

크롤러 실행 후:
- [ ] Staging 데이터 확인
- [ ] 검증 실행 및 통과율 확인
- [ ] 문제있는 데이터 수동 검토
- [ ] 이관 실행
- [ ] 프로덕션 데이터 최종 확인

---

## 📞 긴급 상황

**DB가 완전히 망가진 경우:**

```sql
-- 1. 백업에서 복구
SELECT restore_tournaments();

-- 2. 백업도 없는 경우: 스키마 재생성
-- docs/DB_CHECK_AND_FIX.sql 실행

-- 3. 샘플 데이터 재입력
-- docs/KATO_DATA_INSERT.sql 실행
```

---

**이제 안전하게 크롤링하세요!** 🛡️✨

**마지막 업데이트**: 2026-01-29
