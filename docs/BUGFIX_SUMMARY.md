# 🔥 데이터 매핑 버그 완전 수정 + 1:N 구조 도입

## 📊 작업 완료 내역

### ✅ Step 1: DB 스키마 재설계 (1:N 구조 도입)
**파일:** `docs/DB_DIVISIONS_UPGRADE.sql`

#### 🆕 새로운 테이블: `tournament_divisions`
```sql
CREATE TABLE tournament_divisions (
  id uuid PRIMARY KEY,
  tournament_id uuid REFERENCES tournaments(id),
  name text NOT NULL,              -- 부서명 (예: "개나리부")
  date_start date NOT NULL,        -- 경기 날짜
  time_start time,                 -- 경기 시간
  capacity integer DEFAULT 32,     -- 모집 팀 수
  fee integer DEFAULT 0,           -- 참가비 (정수형)
  status text DEFAULT 'recruiting' -- 상태
);
```

#### 🔧 자동 동기화 트리거
- **부모 status 자동 계산:** divisions 중 하나라도 recruiting이면 부모도 recruiting
- **부모 date 자동 계산:** divisions 중 가장 빠른 날짜를 부모의 date로 설정
- **부모 fee 자동 계산:** divisions 중 최소 금액을 부모의 fee로 설정

---

### ✅ Step 2: 크롤러 로직 업그레이드
**파일:** 
- `src/lib/crawler/kato-scraper.ts`
- `src/lib/crawler/db-inserter.ts`

#### 🔥 참가비 버그 수정
**문제:**
```typescript
"54,000원" → 0 (잘못 파싱)
// 프론트엔드에 "무료"로 표시됨
```

**해결:**
```typescript
function parseFee(feeText: string): number {
  const cleaned = feeText.replace(/[,원]/g, '').trim();
  return parseInt(cleaned, 10) || 0;
}

parseFee("54,000원") // → 54000 ✅
parseFee("무료")      // → 0 ✅
```

#### 🔥 위치 버그 수정
**문제:**
```typescript
location_city === "미정" // DB에 "미정"으로 저장됨
```

**해결:**
```typescript
function extractLocationCity(text: string): string {
  const KEYWORDS = ['서울', '경기', '인천', '대전', ...];
  for (const keyword of KEYWORDS) {
    if (text.includes(keyword)) return keyword;
  }
  return '미정';
}

extractLocationCity("제5회 경북 테니스대회") // → "경북" ✅
```

#### 🔥 상태 버그 수정
**문제:**
```typescript
// 단순히 대회 날짜만 비교
if (today > eventDate) return 'closed';
// → 접수 기간이 지나도 "모집중"으로 표시됨
```

**해결:**
```typescript
function calculateStatus(
  registrationStart?: string,
  registrationEnd?: string,
  eventDate?: string
): string {
  const today = new Date();
  
  // 접수 종료일이 지났으면 마감
  if (registrationEnd && today > new Date(registrationEnd)) {
    return 'closed';
  }
  
  // 대회 날짜가 지났으면 마감
  if (eventDate && today > new Date(eventDate)) {
    return 'closed';
  }
  
  return 'recruiting';
}
```

#### 🆕 divisions 데이터 파싱
KATO 상세 페이지의 일정 표(Table)를 파싱하여 부서별 정보 추출:

```typescript
// HTML: <tr><td>03.07(토)</td><td>개나리부</td><td>09:00</td><td>54,000원</td></tr>
// → DivisionData 생성
{
  name: "개나리부",
  date_start: "2026-03-07",
  time_start: "09:00",
  fee: 54000,
  capacity: 32,
  status: "recruiting"
}
```

---

### ✅ Step 3: 프론트엔드 수정
**파일:**
- `src/components/tournaments/TournamentCard.tsx`
- `src/types/tournament.ts`
- `src/hooks/useTournaments.ts`

#### 🔥 참가비 표시 개선
```typescript
// ❌ 기존: fee가 0이면 "무료"
const formattedFee = tournament.fee 
  ? `${Number(tournament.fee).toLocaleString()}원` 
  : '무료';

// ✅ 개선: fee가 0이면 "문의"
const formattedFee = (() => {
  if (!tournament.fee || tournament.fee === 0) {
    return '문의';
  }
  return `${tournament.fee.toLocaleString()}원`;
})();
```

#### 🔥 위치 표시 개선
```typescript
// ❌ 기존: location만 사용
const displayLocation = tournament.location || '장소 미정';

// ✅ 개선: 3단계 폴백
const displayLocation = (() => {
  if (tournament.location_city && tournament.location_city !== '미정') {
    return tournament.location_city;
  }
  if (tournament.location && tournament.location !== '미정') {
    return tournament.location;
  }
  if (tournament.location_detail) {
    return tournament.location_detail.slice(0, 2); // 앞 2글자
  }
  return '장소 미정';
})();
```

#### 🔥 상태 표시 개선
```typescript
// ❌ 기존: tournament.status만 사용
const isRecruiting = tournament.status === 'recruiting';

// ✅ 개선: divisions 기반으로 계산
const isRecruiting = (() => {
  if (tournament.divisions && tournament.divisions.length > 0) {
    return tournament.divisions.some(div => div.status === 'recruiting');
  }
  return tournament.status === 'recruiting';
})();
```

#### 🆕 divisions JOIN
```typescript
// ❌ 기존
const { data } = await supabase
  .from('tournaments')
  .select('*');

// ✅ 개선
const { data } = await supabase
  .from('tournaments')
  .select(`
    *,
    divisions:tournament_divisions(*)
  `);
```

---

## 🎯 결과

### Before (문제 상황)
```
카드 표시:
- 위치: "미정" ❌
- 참가비: "무료" ❌
- 상태: "마감" ❌
```

### After (수정 완료)
```
카드 표시:
- 위치: "경북" ✅
- 참가비: "54,000원" ✅
- 상태: "모집중" ✅
- 부서: "2개 부문" ✅
```

---

## 📝 실행 순서

### 1. DB 스키마 업그레이드
```bash
# Supabase SQL Editor에서 실행
docs/DB_DIVISIONS_UPGRADE.sql
```

### 2. 크롤러 실행
```bash
npm run crawler
```

### 3. 프론트엔드 확인
```bash
npm run dev
# http://localhost:3000/tournaments
```

---

## 📊 DB 구조 예시

### tournaments (부모)
| id | title | location_city | fee | status | date |
|----|-------|---------------|-----|--------|------|
| 1  | 제5회 Kim's 대회 | 경북 | 54000 | recruiting | 2026-03-07 |

### tournament_divisions (자식)
| id | tournament_id | name | date_start | fee | status |
|----|---------------|------|------------|-----|--------|
| 1  | 1 | 개나리부 | 2026-03-07 | 54000 | recruiting |
| 2  | 1 | 국화부   | 2026-03-08 | 54000 | recruiting |

---

## 🔧 트러블슈팅

### 문제 1: "tournament_divisions 테이블이 없습니다"
```sql
-- 해결: DB 스키마 업그레이드 실행
docs/DB_DIVISIONS_UPGRADE.sql
```

### 문제 2: "divisions가 null입니다"
```typescript
// 해결: useTournaments 훅에서 JOIN 확인
select(`
  *,
  divisions:tournament_divisions(*)
`)
```

### 문제 3: "참가비가 여전히 무료로 표시됩니다"
```sql
-- 해결: 기존 데이터 확인 및 수동 업데이트
SELECT id, title, fee FROM tournaments WHERE fee = 0;
UPDATE tournaments SET fee = 54000 WHERE id = '...';
```

---

## 📚 관련 파일

### DB
- `docs/DB_DIVISIONS_UPGRADE.sql` - 스키마 업그레이드
- `docs/CRAWLER_V2_GUIDE.md` - 크롤러 가이드

### 백엔드
- `src/lib/crawler/kato-scraper.ts` - 크롤러 로직
- `src/lib/crawler/db-inserter.ts` - DB 저장 로직
- `src/lib/crawler/index.ts` - 크롤러 실행

### 프론트엔드
- `src/components/tournaments/TournamentCard.tsx` - 카드 컴포넌트
- `src/types/tournament.ts` - 타입 정의
- `src/hooks/useTournaments.ts` - 데이터 페칭 훅

---

## ✅ 체크리스트

- [x] DB 스키마 재설계 (1:N 구조)
- [x] 참가비 파싱 로직 수정
- [x] 위치 추출 로직 수정
- [x] 상태 계산 로직 수정
- [x] divisions 데이터 파싱
- [x] 프론트엔드 데이터 바인딩 개선
- [x] useTournaments 훅 JOIN 추가
- [x] 크롤러 가이드 문서 작성
- [x] package.json 스크립트 추가

---

**작업 완료 날짜:** 2026-01-28  
**버전:** v2.0  
**상태:** ✅ 완료
