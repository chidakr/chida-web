# 치다 프로젝트 — 폴더/파일 배치 규칙

개발할 때 **어디에 뭘 두면 되는지**만 빠르게 참고하는 문서다.

---

## 1. `src/` 아래 대분류

| 폴더 | 용도 | 예시 |
|------|------|------|
| **`app/`** | 라우트(URL)당 1페이지. 페이지·라우트 전용 컴포넌트만. | `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` |
| **`components/`** | **여러 라우트에서 재사용**하는 UI. 페이지에 묶이지 않음. | `layout/Header`, `tournaments/TournamentCard` |
| **`utils/`** | Supabase 클라이언트, 공용 헬퍼 함수. | `supabase/client.ts`, `supabase/server.ts` |
| **`types/`** | 전역/도메인 타입 정의. | `Tournament`, `Profile`, `Participant`, `Bookmark` 등 |
| **`constants/`** | 앱 전역 상수 (필터 옵션, 설정값 등). | `tournaments.ts` (CATEGORIES, LOCATIONS) |
| **`hooks/`** | 공용 React 훅. | `useTournaments`, `useTournamentsSimple` |

---

## 2. `app/` 안에서 쓰는 규칙

- **한 URL의 화면만 쓰는 UI** → 그 라우트 폴더 안에 둬도 됨.  
  예: `app/tournaments/[id]/page.tsx` 전용 작은 컴포넌트 → `app/tournaments/[id]/` 아래에 두거나 같은 파일에.
- **다른 라우트에서도 쓸 거면** → `components/`로 올리기.
- **라우트 공통**  
  - `layout.tsx` → 그 세그먼트 공통 레이아웃  
  - `loading.tsx` → 로딩 UI  
  - `error.tsx` → 에러 UI  
  - `page.tsx` → 해당 URL의 메인 페이지

---

## 3. `components/` 안에서 쓰는 규칙

- **도메인별로 하위 폴더** 두기.  
  예: `components/tournaments/`, `components/auth/`, `components/layout/`.
- 한 폴더에 **여러 컴포넌트**면 `index.ts`로 re-export 해두면 import 짧아짐.  
  예: `import { TournamentCard } from '@/components/tournaments'`

---

## 4. Supabase / API

- **브라우저(클라이언트)** → `import { createClient } from '@/utils/supabase/client'`
- **서버(API 라우트, Server Component, Server Action)** → `import { createClient } from '@/utils/supabase/server'`
- **API 라우트**는 `app/api/` 아래에.  
  예: `app/api/withdraw/route.ts`

---

## 5. import 경로 (alias)

- `@/` = `src/`  
  - `@/components/...` = `src/components/...`  
  - `@/utils/supabase/client`  
  - `@/types`  
  - `@/app/auth/LoginModal` (app 내부 모듈 참조할 때)

---

## 6. 새 기능 넣을 때 체크

1. **타입** 추가 필요하면 → `src/types/` 에 정의하고 `index.ts`에서 export.
2. **공용 상수** (옵션 목록, 설정값) → `src/constants/` 에 파일 만들기.
3. **공용 UI** 생기면 → `src/components/` 에 도메인 폴더 만들고 넣기.
4. **데이터 fetch/상태 로직** 공유 → `src/hooks/` 에 커스텀 훅으로 넣기.
5. **새 페이지(URL)** → `app/` 아래에 폴더 만들고 `page.tsx` 추가. 404는 `app/not-found.tsx` 로 커스텀 가능.
6. **새 API** → `app/api/도메인/이름/route.ts` (예: `api/auth/withdraw`).

이거만 지키면 구조 일관되게 유지할 수 있다.
