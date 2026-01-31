# KATO 실제 대회 데이터 가이드

## 📊 데이터 추가 방법

### 1단계: SQL 파일 실행
```sql
-- Supabase SQL Editor에서 실행
-- 파일: docs/KATO_DATA_INSERT.sql
```

### 2단계: 이미지 확인
- KATO 로고 이미지: `public/images/kato-groupa.png`
- Next.js 자동으로 `/images/kato-groupa.png` 경로 서빙

---

## 🎨 KATO 이미지 그룹 분류

KATO는 대회를 그룹으로 분류합니다:

- **Group A** (`groupa`): 일반 대회
- **Group 2** (`group2`): 특정 카테고리
- **Group 3** (`group3`): 특정 카테고리

**현재 전략**: 모든 대회에 Group A 이미지 통일 사용 (UX 일관성)

---

## 📅 상태(Status) 계산 로직

오늘 날짜: **2026-01-28**

| 조건 | Status | 예시 |
|------|--------|------|
| 접수 시작일 < 오늘 | 접수예정 | 접수 시작: 2/1 |
| 접수 기간 중 | 접수중 | 접수: 1/15 ~ 2/20 |
| 대회일 7일 이내 | 마감임박 | 대회일: 2/3 |
| 대회일 지남 | 마감 | 대회일: 1/20 |

---

## 🔄 추가 대회 입력 시

```sql
INSERT INTO tournaments (
  title, date, time, location, fee, 
  max_participants, current_participants, status, level,
  description, site_url, image_url, organizer
) VALUES (
  '대회명',
  '2026-02-15',  -- YYYY-MM-DD
  '09:00',
  '서울',  -- 지역만 (상세 주소는 description에)
  80000,
  64,
  0,
  '접수중',  -- 상태 계산 로직 적용
  '오픈부',
  '상세 설명...',
  'https://kato.kr/openGame/XXXX',
  '/images/kato-groupa.png',
  'KATO'
);
```

---

## ⚠️ 주의사항

1. **날짜 형식**: 반드시 `YYYY-MM-DD` (ISO 8601)
2. **지역 분류**: 제목/장소에서 "서울", "경기", "인천" 등 추출
3. **이미지 경로**: `/images/kato-groupa.png` (public 폴더 기준)
4. **참가비**: 숫자만 (원 단위, 쉼표 없이)
5. **organizer**: 'KATO'로 통일 (필터링 용이)

---

## 🚀 다음 단계

더 많은 대회 데이터를 추가하려면:
1. KATO 웹사이트에서 대회 리스트 복사
2. 이 문서의 템플릿 사용해서 SQL 작성
3. Supabase SQL Editor에서 실행
