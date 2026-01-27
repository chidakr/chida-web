/** 대회 테이블 / API 응답용 공용 타입 */
export interface Tournament {
  id: string;
  title: string;
  date: string;
  time?: string;
  location: string;
  fee?: number | string;
  current_participants?: number;
  max_participants?: number;
  description?: string;
  status: string;
  image_url?: string | null;
  site_url?: string | null;
  registration_link?: string | null;
  level?: string | null;
  organizer?: string | null;
  view_count?: number;
  created_at?: string;
  updated_at?: string;
}
