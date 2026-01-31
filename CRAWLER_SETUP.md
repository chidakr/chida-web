# 🕷️ 크롤러 설치 및 실행 가이드

## 📦 필수 패키지 설치

```bash
npm install tsx --save-dev
```

## 🚀 실행 방법

### 1회 실행
```bash
npm run crawl
```

### 결과 예시
```
🚀 크롤러 시작
==================================================
⏰ 실행 시간: 2026-01-29 19:30:00
==================================================

🔍 KATO 사이트 크롤링 시작...
✅ KATO 크롤링 완료: 4건 수집

📊 총 4개 대회 처리 시작...

✅ 저장 완료: "제10회 인천광역시테니스협회장배 전국동호인테니스대회"
✅ 저장 완료: "제4회 대전명봉클럽배 전국동호인테니스대회"
✅ 저장 완료: "제5회 Kim's전국동호인테니스대회"
⏭️  중복 데이터: "제23회 서귀포칠십리 전국동호인테니스대회" (2026-01-21)는 이미 존재합니다.

📊 처리 완료:
   ✅ 성공: 3건
   ⏭️  중복 스킵: 1건
   ❌ 실패: 0건
   📋 총계: 4건
```

## ⚠️ 중요 사항

1. **환경변수 확인**
   - `.env.local` 파일에 다음이 설정되어 있어야 합니다:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. **Status 관리**
   - 크롤링된 데이터는 `status: 'draft'`로 저장됩니다
   - 관리자가 확인 후 Supabase에서 'open'으로 변경해야 합니다

3. **중복 방지**
   - `title` + `date` 기준으로 자동 중복 체크
   - 이미 있는 대회는 자동으로 스킵됩니다

## 📁 파일 구조

```
src/lib/crawler/
├── index.ts           # 메인 크롤러
├── kato-scraper.ts    # KATO 사이트 스크래퍼
└── db-inserter.ts     # DB 저장 로직

scripts/
└── crawl.ts           # 실행 스크립트
```

## 🔄 정기 실행 (옵션)

GitHub Actions, Vercel Cron, 또는 로컬 Cron으로 자동화 가능:

```yaml
# .github/workflows/crawler.yml
name: Daily Crawler
on:
  schedule:
    - cron: '0 9 * * *'  # 매일 오전 9시
jobs:
  crawl:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run crawl
```
