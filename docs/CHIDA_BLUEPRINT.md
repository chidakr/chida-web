# 🦄 Project CHIDA: The Next Generation Tennis Platform

> **Target:** 1 Trillion KRW Valuation (Unicorn Status)
> **Mission:** "테니스 대회를 찾는 행위"를 "즐거운 쇼핑 경험"으로 혁신한다.
> **Philosophy:** Data Integrity, Hip & Modern UX, Extreme Performance.

---

## 1. 비즈니스 컨텍스트 & 비전 (Context & Vision)
이 프로젝트는 단순한 정보 수집 사이트가 아니다. **파편화된 테니스 대회 시장을 통합하는 '슈퍼 앱(Super App)'**이다.

### 1.1 핵심 경쟁력 (Core Competencies)
1.  **초격차 데이터 (Data Dominance):** KATO, KATA, KTA 등 모든 협회의 데이터를 **실시간(Real-time)**으로 긁어와, 가장 빠르고 정확하게 제공한다.
2.  **압도적 UX (Overwhelming UX):** 텍스트 범벅인 기존 협회 사이트와 달리, **'무신사(Musinsa)', '토스(Toss)', '크림(KREAM)'** 급의 비주얼과 마이크로 인터랙션을 제공한다.
3.  **플랫폼 생태계 (Ecosystem):** 대회 검색 → 매칭(팀 찾기) → 결제 → 대회 후기까지 이어지는 **All-in-One 라이프사이클**을 구축한다.

---

## 2. 시스템 아키텍처 (System Architecture)
우리는 **확장성(Scalability)**과 **유지보수성(Maintainability)**을 최우선으로 한다.

### 2.1 기술 스택 (Tech Stack: Immutable)
* **Core:** `Next.js 14 (App Router)` - 서버 사이드 렌더링(SSR) 적극 활용.
* **Type Safety:** `TypeScript` (Strict Mode 필수). `any` 타입 사용 시 사유서 제출 수준으로 엄격 금지.
* **Style:** `Tailwind CSS` + `Shadcn/UI` + `Framer Motion` (애니메이션).
* **Backend/DB:** `Supabase` (Auth, Postgres, Realtime, Storage).
* **Crawler Engine:** `Python 3.10+` based Modular System (`BeautifulSoup4`, `Playwright`).

### 2.2 폴더 구조 전략 (Directory Strategy)
* `/app`: 페이지 라우팅 및 레이아웃. (Server Components 원칙)
* `/components`:
    * `/ui`: 버튼, 인풋 등 가장 작은 단위 (Atomic).
    * `/feature`: `TournamentCard`, `FilterBar` 등 비즈니스 로직이 포함된 컴포넌트.
* `/modules`: (Python) 크롤러 모듈 집합소.
    * `base_scraper.py`: 모든 크롤러의 부모 클래스 (인터페이스 정의).
    * `kato_scraper.py`, `kata_scraper.py`: 실제 구현체.
* `/types`: 프론트엔드와 백엔드 간의 데이터 계약(Interface) 정의.

---

## 3. 개발 및 데이터 원칙 (Development Principles)

### 3.1 데이터 무결성 (Data Integrity)
* **표준화(Normalization):** 각 협회마다 다른 날짜 포맷(`2024.01.01`, `24-01-01`)을 **ISO 8601(`YYYY-MM-DD`)**로 무조건 통일하여 DB에 저장한다.
* **상태 관리:** 대회의 상태는 `접수중(OPEN)`, `마감임박(CLOSING)`, `마감(CLOSED)`, `취소(CANCELED)`로 엄격히 관리한다.

### 3.2 UX/UI 가이드라인 (The "Hip" Vibe)
* **Mobile First:** 모든 화면은 모바일 뷰를 기준으로 설계한다.
* **Skeleton Loading:** 데이터 로딩 중에는 반드시 스켈레톤 UI를 보여주어 이탈을 막는다.
* **Imagery:** 이미지가 없는 대회는 'CHIDA 전용 플레이스홀더'를 예쁘게 보여준다. (깨진 이미지 금지)

### 3.3 레거시 보호 (Legacy Protection)
* 현재 안정화된 `KATO 크롤러`와 `기본 웹 뷰`는 회사의 자산이다.
* 새로운 기능(`KATA 크롤러`, `어드민`)을 추가할 때, **기존 코드를 수정하기보다는 '확장(Extends)'하는 방식**을 택한다.

---

## 4. 현재 미션 및 로드맵 (Current Mission)

### ✅ Phase 1: 기반 구축 (완료)
- 웹 프레임워크 및 기본 UI 시스템 구축.
- KATO 크롤러 안정화 및 자동화.

### 🚧 Phase 2: 확장 및 고도화 (현재 진행 중)
- **[최우선] KATA(신규 협회) 크롤러 모듈 개발:**
    - 기존 `Scraper` 클래스를 상속받아 구조적 통일성 유지.
    - KATA 사이트 특유의 테이블 구조 파싱 로직 구현.
- **[진행 중] CEO 관제 대시보드 (Admin):**
    - 매출, 가입자, 트래픽을 실시간(Supabase Realtime)으로 시각화.
    - V0가 생성한 UI에 실제 데이터 바인딩.

---

## 5. AI 협업 프로토콜 (R&R)

이 프로젝트는 **Human CEO**와 **AI Team**의 협업으로 이루어진다.

* **👨‍💼 CEO (User):** 비전 제시, 의사 결정, 최종 감리.
* **🧠 Gemini (CTO):** 비즈니스 전략, UI/UX 디렉팅, 에러 로그 분석, **Notion 문서화 지시**.
* **🤖 Claude Code (Tech Lead):**
    * **역할:** 전체 아키텍처 설계, DB 스키마 관리, 복잡한 로직 리팩토링.
    * **행동:** 작업 전 반드시 이 문서를 읽고(`Read`), '안전한 설계'를 먼저 제안한다.
* **🛠️ Cursor (Senior Dev):**
    * **역할:** Claude의 설계를 바탕으로 한 고속 구현, UI 폴리싱.
    * **행동:** `.cursorrules`를 준수하며 타협 없는 코드 퀄리티를 유지한다.