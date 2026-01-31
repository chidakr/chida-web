-- [1] 참가자(Participants) 테이블 생성
-- 설명: 대회 참가 신청 정보를 저장하는 테이블
create table participants (
  id uuid default gen_random_uuid() primary key,
  tournament_id uuid references tournaments(id) on delete cascade, -- 대회 삭제되면 참가자도 삭제
  team_name text not null,       -- 팀/클럽명
  leader_name text not null,     -- 대표자 이름
  phone text not null,           -- 연락처
  level text,                    -- 구력(선택)
  status text default '신청완료', -- 상태 (신청완료/입금확인/취소 등)
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- [1-1] 참가자 테이블 보안 정책 (RLS) 설정
-- 설명: 누구나 신청은 할 수 있게, 조회는 관리자만(일단은 다 열어둠)
alter table participants enable row level security;

create policy "누구나 신청 가능"
on participants for insert
with check (true);

create policy "관리자만 조회 가능 (현재는 전체 허용)"
on participants for select
using (true);

-- ---------------------------------------------------------

-- [2] 대회 테이블 확장: 외부 링크 연결
-- 설명: 직접 접수 대신 외부 사이트(네이버폼 등) 링크를 저장할 칸 추가
alter table tournaments add column registration_link text;

-- ---------------------------------------------------------

-- [3] 대회 테이블 확장: 조회수 기능
-- 설명: 조회수를 저장할 칸(view_count) 추가 및 초기값 0 설정
alter table tournaments add column view_count bigint default 0;

-- [3-1] 안전한 조회수 증가 함수 (RPC)
-- 설명: 동시 접속자가 많아도 숫자가 꼬이지 않고 정확하게 +1 해주는 함수
create or replace function increment_view_count(row_id uuid)
returns void as $$
begin
  update tournaments
  set view_count = view_count + 1
  where id = row_id;
end;
$$ language plpgsql;