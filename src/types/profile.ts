/** profiles 테이블 / API 응답 */
export interface Profile {
  id: string;
  full_name?: string | null;
  ntrp?: string | null;
  years?: string | null;
  style?: string | null;
  motto?: string | null;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}
