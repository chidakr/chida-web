import type { Tournament } from './tournament';

/** bookmarks 테이블 / API 응답 */
export interface Bookmark {
  id: string;
  user_id: string;
  tournament_id: string;
  created_at?: string;
}

/** 북마크 목록 조회 시 조인 결과 (tournaments 포함) */
export interface BookmarkWithTournament {
  id: string;
  created_at?: string;
  tournaments: Pick<Tournament, 'id' | 'title' | 'date' | 'location' | 'status'>;
}
