/** 대회 부서 (자식 테이블) */
export interface TournamentDivision {
  id: string;
  tournament_id: string;
  name: string;                    // 부서명 (예: "개나리부") - 필수
  description?: string;            // 부서 설명 - 선택
  date_start: string;              // 경기 시작 날짜 - 필수
  date_end?: string;               // 경기 종료 날짜 - 선택
  time_start?: string;             // 경기 시작 시간 - 선택
  location?: string;               // 부서별 경기 장소 - 선택 (없으면 부모 location 사용)
  capacity: number;                // 모집 팀 수 - 필수
  current_participants: number;    // 현재 참가 팀 수 - 필수
  fee: number;                     // 참가비 (정수형) - 필수
  account_bank?: string;           // 은행명 - 선택 (동네 대회는 없을 수 있음)
  account_number?: string;         // 계좌번호 - 선택
  account_owner?: string;          // 예금주 - 선택
  registration_start_date?: string; // 접수 시작일 - 선택
  registration_end_date?: string;   // 접수 종료일 - 선택
  status: string;                  // 'recruiting', 'closed', 'cancelled' - 필수
  metadata?: Record<string, any>;  // 🌐 NEW: 유연한 메타데이터 (JSONB)
  created_at?: string;
  updated_at?: string;
}

/** 대회 (부모 테이블) */
export interface Tournament {
  id: string;
  title: string;
  date: string;                    // 전체 대회 시작일 (가장 빠른 부서 날짜)
  date_end?: string;               // 전체 대회 종료일
  time?: string;
  location: string;                // 도시/지역 (예: "경북")
  location_city?: string;          // 도시 (location과 동일, 하위 호환)
  location_detail?: string;        // 상세 주소
  fee?: number;                    // 대표 참가비 (최소 금액)
  current_participants?: number;
  max_participants?: number;
  description?: string;
  status: string;                  // 전체 대회 상태
  category?: string | null;
  thumbnail_url?: string | null;
  image_url?: string | null;       // 하위 호환성 유지
  site_url?: string | null;
  registration_link?: string | null;
  registration_start_date?: string; // 전체 대회 접수 시작일
  registration_end_date?: string;   // 전체 대회 접수 종료일
  level?: string | null;
  organizer?: string | null;       // 주최자 - 선택
  host?: string | null;            // 주관 - 선택 (KATO 대회 등)
  sponsor?: string | null;         // 후원 - 선택 (메이저 대회)
  game_ball?: string | null;       // 사용구 - 선택 (공식 대회)
  refund_policy?: string | null;   // 환불 규정 - 선택
  crawled_url?: string | null;     // 크롤링한 원본 URL
  view_count?: number;
  metadata?: Record<string, any>;  // 🌐 NEW: 유연한 메타데이터 (JSONB)
  created_at?: string;
  updated_at?: string;

  // 관계 데이터 (JOIN 시 포함)
  divisions?: TournamentDivision[]; // 부서 정보
}
