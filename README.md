feat: 대회 상세 페이지 조회수 기능 추가 및 UI 개선

1. Backend (Supabase)
- tournaments 테이블 view_count 컬럼 추가
- 조회수 증가용 RPC 함수(increment_view_count) 추가

2. Frontend
- 상세 페이지 진입 시 조회수 자동 증가 로직 적용
- 상세 페이지 타이틀 영역 조회수 UI(Eye Icon) 추가
- 대회 리스트 페이지 상단 여백 및 헤더 고정 스타일 수정

3. Fix
- 메인/리스트 페이지 반응형 레이아웃 깨짐 현상 수정