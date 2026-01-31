/** participants 테이블 / API 응답 */
export interface Participant {
  id: string;
  tournament_id: string;
  user_id?: string | null;
  team_name?: string;
  leader_name?: string;
  phone?: string;
  level?: string | null;
  status?: string;
  created_at?: string;
}
