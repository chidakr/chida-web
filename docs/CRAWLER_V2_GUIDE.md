# 🕷️ 크롤러 v2.0 완전 가이드

## 🎯 목표
KATO 사이트의 대회 데이터를 수집하여 DB에 저장합니다.

**v2.0 주요 개선사항:**
- ✅ **참가비 버그 수정**: 콤마/원 제거 후 정수 저장
- ✅ **위치 버그 수정**: location_city 정확히 추출
- ✅ **상태 버그 수정**: 접수 기간 기반으로 정확히 계산
- ✅ **1:N 구조 도입**: divisions 테이블 분리 (무신사 옵션 스타일)

---

## 📋 사전 준비

### 1. DB 스키마 업그레이드
먼저 DB에 `tournament_divisions` 테이블을 생성해야 합니다.

```bash
# Supabase SQL Editor에서 실행
docs/DB_DIVISIONS_UPGRADE.sql
```

### 2. 환경 변수 설정
`.env.local` 파일에 다음 변수가 설정되어 있어야 합니다:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## 🚀 크롤러 실행 방법

### 방법 1: npm 스크립트 (권장)
```bash
npm run crawler
```

### 방법 2: Node.js 직접 실행
```bash
node -r ts-node/register src/lib/crawler/index.ts
```

### 방법 3: API 엔드포인트 (웹 인터페이스)
```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 접속
http://localhost:3000/api/crawler/run
```

---

## 📊 크롤링 데이터 구조

### 부모 테이블: `tournaments`
```json
{
  "title": "제5회 Kim's 전국동호인테니스대회",
  "location": "경북",
  "location_city": "경북",
  "location_detail": "경북대학교 테니스장",
  "organizer": "KATO",
  "crawled_url": "https://kato.kr/openGame/12345",
  "thumbnail_url": "https://kato.kr/images/poster.jpg",
  "registration_start_date": "2026-02-01",
  "registration_end_date": "2026-02-28",
  "status": "recruiting",
  "fee": 54000,
  "date": "2026-03-07"
}
```

### 자식 테이블: `tournament_divisions`
```json
[
  {
    "name": "개나리부",
    "date_start": "2026-03-07",
    "time_start": "09:00",
    "fee": 54000,
    "capacity": 32,
    "status": "recruiting"
  },
  {
    "name": "국화부",
    "date_start": "2026-03-08",
    "time_start": "09:00",
    "fee": 54000,
    "capacity": 32,
    "status": "recruiting"
  }
]
```

---

## 🔧 주요 기능

### 1. 참가비 파싱 (`parseFee`)
**기존 문제:**
- "54,000원" → 0 (잘못 파싱)
- 프론트엔드에 "무료"로 표시됨

**해결 방법:**
```typescript
parseFee("54,000원") // → 54000 (정수)
parseFee("무료")      // → 0
```

### 2. 위치 추출 (`extractLocationCity`)
**기존 문제:**
- location_city가 비어있거나 "미정"으로 저장됨

**해결 방법:**
```typescript
extractLocationCity("제5회 경북 테니스대회") // → "경북"
extractLocationCity("서울 강남구 대회")     // → "서울"
```

### 3. 상태 계산 (`calculateStatus`)
**기존 문제:**
- 단순히 대회 날짜와 현재 날짜만 비교
- 접수 기간이 지나도 "모집중"으로 표시

**해결 방법:**
```typescript
calculateStatus(
  "2026-02-01",  // 접수 시작일
  "2026-02-28",  // 접수 종료일
  "2026-03-07"   // 대회 날짜
)
// → 현재 날짜가 2026-02-15면 "recruiting"
// → 현재 날짜가 2026-03-01면 "closed"
```

### 4. 일정 표 파싱 (KATO 상세 페이지)
HTML 테이블에서 부서별 정보를 추출합니다:

```html
<table>
  <tr>
    <td>03.07(토)</td>
    <td>개나리부</td>
    <td>09:00</td>
    <td>54,000원</td>
  </tr>
  <tr>
    <td>03.08(일)</td>
    <td>국화부</td>
    <td>09:00</td>
    <td>54,000원</td>
  </tr>
</table>
```

→ 2개의 `tournament_divisions` 레코드 생성

---

## 🛡️ 안전 장치

### 1. 중복 방지
- **기준:** `title + date_start` 조합
- **동작:** 이미 존재하는 대회는 스킵

### 2. 데이터 검증
- 필수 필드 체크 (title, location_city, divisions)
- 날짜 형식 검증 (YYYY-MM-DD)
- 참가비 정수 변환 검증

### 3. 트랜잭션 롤백
- 부모(tournaments) 저장 성공 → 자식(divisions) 저장 실패 시
- 부모 레코드 자동 삭제 (데이터 일관성 유지)

### 4. Status: 'draft'
- 크롤링된 데이터는 기본적으로 `status='draft'`
- 관리자가 검토 후 'recruiting'으로 변경

---

## 📈 실행 결과 예시

```
🚀 크롤러 시작...

================================================
📅 실행 시각: 2026-01-28 14:30:00
================================================

🔍 KATO 리스트 페이지 크롤링 시작...
  🔍 상세 페이지 크롤링: https://kato.kr/openGame/12345
  🔍 상세 페이지 크롤링: https://kato.kr/openGame/12346
✅ KATO 리스트 크롤링 완료: 15건 수집

📊 총 15개 대회 처리 시작...

✅ 저장 완료: "제5회 Kim's 전국동호인테니스대회" (2개 부서)
✅ 저장 완료: "제10회 인천광역시테니스협회장배" (3개 부서)
⏭️  중복 데이터: "제23회 서귀포참실리" (2026-01-21)는 이미 존재합니다.

📊 처리 완료:
   ✅ 성공: 10건
   ⏭️  중복 스킵: 4건
   ❌ 실패: 1건
   📋 총계: 15건

================================================
✅ 크롤러 완료!
================================================
```

---

## 🐛 트러블슈팅

### 문제 1: "Module not found: cheerio"
**원인:** HTML 파싱 라이브러리 미설치

**해결:**
```bash
npm install cheerio
npm install --save-dev @types/cheerio
```

### 문제 2: "SUPABASE_SERVICE_ROLE_KEY is not defined"
**원인:** 환경 변수 누락

**해결:**
```bash
# .env.local 파일 확인
echo $SUPABASE_SERVICE_ROLE_KEY
```

### 문제 3: "tournament_divisions 테이블이 없습니다"
**원인:** DB 스키마 업그레이드 안 함

**해결:**
```sql
-- Supabase SQL Editor에서 실행
docs/DB_DIVISIONS_UPGRADE.sql
```

### 문제 4: "참가비가 여전히 무료로 표시됩니다"
**원인:** 프론트엔드 캐시 또는 기존 데이터

**해결:**
```sql
-- 기존 데이터 확인
SELECT id, title, fee FROM tournaments WHERE fee = 0;

-- 수동 업데이트 (예시)
UPDATE tournaments SET fee = 54000 WHERE id = '...';
```

---

## 🔄 정기 실행 (Cron Job)

### Vercel Cron (권장)
```javascript
// vercel.json
{
  "crons": [{
    "path": "/api/crawler/run",
    "schedule": "0 9 * * *"  // 매일 오전 9시
  }]
}
```

### GitHub Actions
```yaml
# .github/workflows/crawler.yml
name: Run Crawler
on:
  schedule:
    - cron: '0 9 * * *'  # 매일 오전 9시 (UTC)
jobs:
  crawler:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run crawler
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_KEY }}
```

---

## 📚 관련 문서

- **DB 스키마 업그레이드:** `docs/DB_DIVISIONS_UPGRADE.sql`
- **크롤러 소스 코드:** `src/lib/crawler/`
- **프론트엔드 수정:** `src/components/tournaments/TournamentCard.tsx`
- **타입 정의:** `src/types/tournament.ts`

---

## ✅ 체크리스트

크롤러 실행 전 확인 사항:

- [ ] DB 스키마 업그레이드 완료 (`tournament_divisions` 테이블 생성)
- [ ] 환경 변수 설정 완료 (`.env.local`)
- [ ] Supabase Storage 설정 완료 (`tournaments` 버킷)
- [ ] RLS 정책 확인 (`tournament_divisions` 읽기 허용)
- [ ] 크롤러 실행 (`npm run crawler`)
- [ ] 결과 확인 (Supabase 대시보드)
- [ ] 프론트엔드 테스트 (`http://localhost:3000/tournaments`)

---

**버전:** v2.0  
**마지막 업데이트:** 2026-01-28  
**작성자:** chida-project team
