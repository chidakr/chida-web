/**
 * 🔒 안전한 DB INSERT 로직 (v2.0 - 1:N 구조 지원)
 * - 부모 tournaments + 자식 tournament_divisions 동시 저장
 * - 중복 방지 (title + date 기준)
 * - 데이터 검증
 * - Status: 'draft'로 저장 (관리자 확인 대기)
 */

import { createClient } from '@supabase/supabase-js';
import type { CrawledTournamentV2, DivisionData } from './kato-scraper';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// 하위 호환성을 위한 레거시 타입
export interface CrawledTournament {
  title: string;
  date: string;
  location: string;
  status?: string;
  site_url?: string;
  registration_link?: string;
  level?: string;
  organizer?: string;
  description?: string;
}

/**
 * 🔍 데이터 검증 (v2)
 */
function validateTournamentV2(data: CrawledTournamentV2): { 
  valid: boolean; 
  errors: string[] 
} {
  const errors: string[] = [];

  // 필수 필드 체크
  if (!data.title || data.title.trim() === '') {
    errors.push('제목(title)이 비어있습니다.');
  }

  if (!data.location_city || data.location_city.trim() === '') {
    errors.push('지역(location_city)이 비어있습니다.');
  }

  if (!data.divisions || data.divisions.length === 0) {
    errors.push('부서(divisions) 정보가 없습니다.');
  } else {
    // 각 division의 필수 필드 체크
    data.divisions.forEach((div, idx) => {
      if (!div.name) {
        errors.push(`부서[${idx}]: 이름이 없습니다.`);
      }
      if (!div.date_start) {
        errors.push(`부서[${idx}]: 날짜가 없습니다.`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 🔍 중복 체크 (title + 가장 빠른 날짜 기준)
 */
async function checkDuplicateV2(
  title: string, 
  dateStart: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('tournaments')
    .select('id')
    .eq('title', title)
    .eq('date', dateStart)
    .limit(1);

  if (error) {
    console.error('❌ 중복 체크 오류:', error);
    return false;
  }

  return data && data.length > 0;
}

/**
 * 💾 안전한 INSERT (v2 - 1:N 구조)
 */
export async function insertTournamentV2(data: CrawledTournamentV2): Promise<{
  success: boolean;
  message: string;
  id?: string;
}> {
  // 1. 데이터 검증
  const validation = validateTournamentV2(data);
  if (!validation.valid) {
    return {
      success: false,
      message: `검증 실패: ${validation.errors.join(', ')}`
    };
  }

  // 2. 가장 빠른 날짜 계산
  const earliestDate = data.divisions
    .map(d => d.date_start)
    .sort()[0];

  // 3. 중복 체크
  const isDuplicate = await checkDuplicateV2(data.title, earliestDate);
  if (isDuplicate) {
    return {
      success: false,
      message: `중복 데이터: "${data.title}" (${earliestDate})는 이미 존재합니다.`
    };
  }

  // 4. 최소 참가비 계산
  const minFee = Math.min(...data.divisions.map(d => d.fee).filter(f => f > 0), 0);

  // 5. 부모 tournaments INSERT
  const parentData = {
    title: data.title.trim(),
    date: earliestDate, // 가장 빠른 날짜
    location: data.location_city.trim(),
    location_city: data.location_city.trim(),
    location_detail: data.location_detail?.trim() || null,
    organizer: data.organizer || 'KATO',
    thumbnail_url: data.thumbnail_url || null,
    crawled_url: data.crawled_url,
    registration_start_date: data.registration_start_date || null,
    registration_end_date: data.registration_end_date || null,
    status: 'draft', // 🔒 관리자 확인 대기
    description: data.description || null,
    fee: minFee,
    view_count: 0
  };

  const { data: inserted, error: parentError } = await supabase
    .from('tournaments')
    .insert(parentData)
    .select('id')
    .single();

  if (parentError) {
    return {
      success: false,
      message: `부모 대회 저장 실패: ${parentError.message}`
    };
  }

  const tournamentId = inserted.id;

  // 6. 자식 tournament_divisions INSERT
  const divisionInserts = data.divisions.map(div => ({
    tournament_id: tournamentId,
    name: div.name.trim(),
    date_start: div.date_start,
    date_end: div.date_end || null,
    time_start: div.time_start || null,
    capacity: div.capacity || 32,
    current_participants: 0,
    fee: div.fee || 0,
    registration_start_date: data.registration_start_date || null,
    registration_end_date: data.registration_end_date || null,
    status: div.status || 'recruiting'
  }));

  const { error: divisionError } = await supabase
    .from('tournament_divisions')
    .insert(divisionInserts);

  if (divisionError) {
    // 부모는 저장되었지만 자식 저장 실패 시 롤백
    await supabase.from('tournaments').delete().eq('id', tournamentId);
    
    return {
      success: false,
      message: `부서 정보 저장 실패: ${divisionError.message}`
    };
  }

  return {
    success: true,
    message: `✅ 저장 완료: "${data.title}" (${data.divisions.length}개 부서)`,
    id: tournamentId
  };
}

/**
 * 🔄 배치 INSERT (v2)
 */
export async function insertTournamentsV2(
  tournaments: CrawledTournamentV2[]
): Promise<{
  total: number;
  success: number;
  skipped: number;
  failed: number;
  results: Array<{ title: string; success: boolean; message: string }>;
}> {
  const results = [];
  let successCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  console.log(`\n📊 총 ${tournaments.length}개 대회 처리 시작...\n`);

  for (const tournament of tournaments) {
    const result = await insertTournamentV2(tournament);
    
    results.push({
      title: tournament.title,
      success: result.success,
      message: result.message
    });

    if (result.success) {
      successCount++;
      console.log(`✅ ${result.message}`);
    } else if (result.message.includes('중복')) {
      skippedCount++;
      console.log(`⏭️  ${result.message}`);
    } else {
      failedCount++;
      console.error(`❌ ${result.message}`);
    }
  }

  console.log(`\n📊 처리 완료:`);
  console.log(`   ✅ 성공: ${successCount}건`);
  console.log(`   ⏭️  중복 스킵: ${skippedCount}건`);
  console.log(`   ❌ 실패: ${failedCount}건`);
  console.log(`   📋 총계: ${tournaments.length}건\n`);

  return {
    total: tournaments.length,
    success: successCount,
    skipped: skippedCount,
    failed: failedCount,
    results
  };
}

/**
 * 🔧 하위 호환성: 레거시 함수 유지
 */
export async function insertTournament(data: CrawledTournament): Promise<{
  success: boolean;
  message: string;
  id?: string;
}> {
  // 레거시 데이터를 v2 형식으로 변환
  const v2Data: CrawledTournamentV2 = {
    title: data.title,
    location: data.location,
    location_city: data.location,
    organizer: data.organizer || 'KATO',
    crawled_url: data.site_url || '',
    status: data.status || 'draft',
    description: data.description,
    divisions: [{
      name: data.level || '일반부',
      date_start: data.date,
      fee: 0,
      capacity: 32,
      status: data.status || 'recruiting'
    }]
  };

  return insertTournamentV2(v2Data);
}

export async function insertTournaments(tournaments: CrawledTournament[]): Promise<{
  total: number;
  success: number;
  skipped: number;
  failed: number;
  results: Array<{ title: string; success: boolean; message: string }>;
}> {
  const v2Tournaments: CrawledTournamentV2[] = tournaments.map(t => ({
    title: t.title,
    location: t.location,
    location_city: t.location,
    organizer: t.organizer || 'KATO',
    crawled_url: t.site_url || '',
    status: t.status || 'draft',
    description: t.description,
    divisions: [{
      name: t.level || '일반부',
      date_start: t.date,
      fee: 0,
      capacity: 32,
      status: t.status || 'recruiting'
    }]
  }));

  return insertTournamentsV2(v2Tournaments);
}
