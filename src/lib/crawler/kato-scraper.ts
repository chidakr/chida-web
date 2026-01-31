/**
 * 🕷️ KATO 사이트 크롤러 (v2.0 - 완전 개선)
 * URL: https://kato.kr/openList
 * 
 * 🔥 버그 수정:
 * - 참가비: 콤마/원 제거 후 정수 변환
 * - 위치: location_city 정확히 추출
 * - 상태: 접수 기간 기반으로 정확히 계산
 * - divisions: 일정 표 파싱하여 부서별 저장
 */

export interface DivisionData {
  name: string;              // 부서명 (예: "개나리부")
  date_start: string;        // YYYY-MM-DD
  date_end?: string;         // YYYY-MM-DD
  time_start?: string;       // HH:MM
  fee: number;               // 정수형 (원 단위)
  capacity?: number;         // 모집 팀 수
  status: string;            // 'recruiting', 'closed'
}

export interface CrawledTournamentV2 {
  // 부모 대회 정보
  title: string;
  location: string;          // 도시/지역 (예: "경북")
  location_city: string;     // 도시 (location과 동일)
  location_detail?: string;  // 상세 주소
  organizer: string;         // 주최자
  thumbnail_url?: string;    // 포스터 이미지
  crawled_url: string;       // 원본 URL
  registration_start_date?: string;  // 접수 시작일
  registration_end_date?: string;    // 접수 종료일
  status: string;            // 전체 대회 상태
  description?: string;      // 대회 설명
  
  // 자식 부서 정보
  divisions: DivisionData[];
}

/**
 * 🔧 유틸리티: 참가비 파싱 (콤마, "원" 제거)
 * "54,000원" → 54000
 * "무료" → 0
 */
function parseFee(feeText: string): number {
  if (!feeText) return 0;
  
  const cleaned = feeText.replace(/[,원]/g, '').trim();
  
  if (cleaned === '' || cleaned === '무료' || cleaned === '0') {
    return 0;
  }
  
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * 🔧 유틸리티: 지역 추출
 * 제목이나 텍스트에서 지역 키워드 추출
 */
const LOCATION_KEYWORDS = [
  '서울', '경기', '인천', '대전', '대구', '광주', '부산', '울산', '세종',
  '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
];

function extractLocationCity(text: string, fallback: string = '미정'): string {
  if (!text) return fallback;
  
  for (const keyword of LOCATION_KEYWORDS) {
    if (text.includes(keyword)) {
      return keyword;
    }
  }
  
  return fallback;
}

/**
 * 🔧 유틸리티: 접수 상태 계산
 * 접수 기간과 현재 날짜를 비교하여 정확한 상태 반환
 */
function calculateStatus(
  registrationStart?: string,
  registrationEnd?: string,
  eventDate?: string
): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 접수 종료일이 있으면 그것을 기준으로
  if (registrationEnd) {
    const endDate = new Date(registrationEnd);
    endDate.setHours(0, 0, 0, 0);
    
    if (today > endDate) {
      return 'closed';
    }
  }
  
  // 접수 시작일이 있으면 시작 전인지 확인
  if (registrationStart) {
    const startDate = new Date(registrationStart);
    startDate.setHours(0, 0, 0, 0);
    
    if (today < startDate) {
      return 'upcoming'; // 접수 예정
    }
  }
  
  // 대회 날짜가 지났으면 마감
  if (eventDate) {
    const event = new Date(eventDate);
    event.setHours(0, 0, 0, 0);
    
    if (today > event) {
      return 'closed';
    }
  }
  
  // 위 조건에 모두 해당하지 않으면 접수중
  return 'recruiting';
}

/**
 * 🕷️ KATO 리스트 페이지 크롤링
 */
export async function scrapeKATOList(): Promise<CrawledTournamentV2[]> {
  const tournaments: CrawledTournamentV2[] = [];
  
  try {
    console.log('🔍 KATO 리스트 페이지 크롤링 시작...');
    
    const response = await fetch('https://kato.kr/openList');
    const html = await response.text();
    
    // HTML 파싱 (실제로는 cheerio나 jsdom 사용 권장)
    const titlePattern = /<a[^>]*class="content-title"[^>]*>(.*?)<\/a>/g;
    const datePattern = /<div[^>]*class="date"[^>]*>(.*?)<\/div>/g;
    const linkPattern = /href="(\/openGame\/\d+)"/g;
    
    const titles = [...html.matchAll(titlePattern)].map(m => m[1].trim());
    const dates = [...html.matchAll(datePattern)].map(m => m[1].trim());
    const links = [...html.matchAll(linkPattern)].map(m => `https://kato.kr${m[1]}`);
    
    const minLength = Math.min(titles.length, dates.length, links.length);
    
    for (let i = 0; i < minLength; i++) {
      const title = titles[i];
      const dateText = dates[i];
      const crawledUrl = links[i];
      
      // 날짜 파싱: "2026.03.07 ~ 2026.03.15" → "2026-03-07"
      const dateMatch = dateText.match(/(\d{4})\.(\d{2})\.(\d{2})/);
      const dateStart = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : '';
      
      // 종료 날짜 파싱 (있으면)
      const endMatch = dateText.match(/~\s*(\d{4})\.(\d{2})\.(\d{2})/);
      const dateEnd = endMatch ? `${endMatch[1]}-${endMatch[2]}-${endMatch[3]}` : dateStart;
      
      // 지역 추출 (제목에서)
      const locationCity = extractLocationCity(title, '미정');
      
      // 🔥 상세 페이지 크롤링 (divisions 데이터 획득)
      const detailData = await scrapeKATODetail(crawledUrl);
      
      tournaments.push({
        title,
        location: locationCity,
        location_city: locationCity,
        location_detail: detailData.location_detail || '',
        organizer: 'KATO',
        crawled_url: crawledUrl,
        thumbnail_url: detailData.thumbnail_url,
        registration_start_date: detailData.registration_start_date,
        registration_end_date: detailData.registration_end_date,
        status: calculateStatus(
          detailData.registration_start_date,
          detailData.registration_end_date,
          dateStart
        ),
        description: detailData.description || title,
        divisions: detailData.divisions || [{
          name: '일반부',
          date_start: dateStart,
          date_end: dateEnd,
          fee: detailData.fee || 0,
          capacity: 32,
          status: 'recruiting'
        }]
      });
    }
    
    console.log(`✅ KATO 리스트 크롤링 완료: ${tournaments.length}건 수집\n`);
    
  } catch (error) {
    console.error('❌ KATO 리스트 크롤링 오류:', error);
  }
  
  return tournaments;
}

/**
 * 🕷️ KATO 상세 페이지 크롤링
 * 일정 표(Table) 파싱하여 divisions 데이터 추출
 */
async function scrapeKATODetail(url: string): Promise<{
  location_detail?: string;
  thumbnail_url?: string;
  registration_start_date?: string;
  registration_end_date?: string;
  description?: string;
  fee?: number;
  divisions: DivisionData[];
}> {
  try {
    console.log(`  🔍 상세 페이지 크롤링: ${url}`);
    
    const response = await fetch(url);
    const html = await response.text();
    
    // 📍 상세 주소 추출
    const addressMatch = html.match(/<div[^>]*class="address"[^>]*>(.*?)<\/div>/s);
    const location_detail = addressMatch ? addressMatch[1].replace(/<[^>]+>/g, '').trim() : '';
    
    // 🖼️ 포스터 이미지 추출
    const imgMatch = html.match(/<img[^>]*src="([^"]*poster[^"]*)"[^>]*>/i);
    const thumbnail_url = imgMatch ? `https://kato.kr${imgMatch[1]}` : '';
    
    // 📝 대회 설명 추출
    const descMatch = html.match(/<div[^>]*class="description"[^>]*>(.*?)<\/div>/s);
    const description = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim() : '';
    
    // 📅 접수 기간 추출
    let registration_start_date: string | undefined;
    let registration_end_date: string | undefined;
    const regPeriodMatch = html.match(/접수기간[:\s]*(\d{4}[.-]\d{2}[.-]\d{2})\s*~\s*(\d{4}[.-]\d{2}[.-]\d{2})/i);
    if (regPeriodMatch) {
      registration_start_date = regPeriodMatch[1].replace(/\./g, '-');
      registration_end_date = regPeriodMatch[2].replace(/\./g, '-');
    }
    
    // 💰 참가비 추출 (기본값)
    let defaultFee = 0;
    const feeMatch = html.match(/참가비[:\s]*([0-9,]+)\s*원/i);
    if (feeMatch) {
      defaultFee = parseFee(feeMatch[1]);
    }
    
    // 🗓️ 일정 표(Table) 파싱 - divisions 추출
    const divisions: DivisionData[] = [];
    
    // 예시: <tr><td>03.07(토)</td><td>개나리부</td><td>09:00</td><td>54,000원</td></tr>
    const tableRowPattern = /<tr[^>]*>(.*?)<\/tr>/gs;
    const tableRows = [...html.matchAll(tableRowPattern)];
    
    for (const row of tableRows) {
      const cells = row[1].match(/<td[^>]*>(.*?)<\/td>/gs);
      if (!cells || cells.length < 2) continue;
      
      const cellTexts = cells.map(cell => 
        cell.replace(/<[^>]+>/g, '').trim()
      );
      
      // 날짜 파싱 (예: "03.07(토)")
      const dateMatch = cellTexts[0]?.match(/(\d{2})\.(\d{2})/);
      if (!dateMatch) continue;
      
      const currentYear = new Date().getFullYear();
      const month = dateMatch[1];
      const day = dateMatch[2];
      const date_start = `${currentYear}-${month}-${day}`;
      
      // 부서명 파싱
      const name = cellTexts[1] || '일반부';
      
      // 시간 파싱 (있으면)
      const time_start = cellTexts[2]?.match(/\d{2}:\d{2}/)?.[0];
      
      // 참가비 파싱 (있으면)
      const feeText = cellTexts[3] || '';
      const fee = parseFee(feeText) || defaultFee;
      
      divisions.push({
        name,
        date_start,
        time_start,
        fee,
        capacity: 32,
        status: calculateStatus(registration_start_date, registration_end_date, date_start)
      });
    }
    
    // divisions가 비어있으면 기본값 생성
    if (divisions.length === 0) {
      const todayMatch = html.match(/(\d{4})[.-](\d{2})[.-](\d{2})/);
      const date_start = todayMatch 
        ? `${todayMatch[1]}-${todayMatch[2]}-${todayMatch[3]}` 
        : new Date().toISOString().split('T')[0];
      
      divisions.push({
        name: '일반부',
        date_start,
        fee: defaultFee,
        capacity: 32,
        status: 'recruiting'
      });
    }
    
    return {
      location_detail,
      thumbnail_url,
      registration_start_date,
      registration_end_date,
      description,
      fee: defaultFee,
      divisions
    };
    
  } catch (error) {
    console.error(`❌ 상세 페이지 크롤링 오류: ${url}`, error);
    return { divisions: [] };
  }
}

/**
 * 🔧 편의 함수: 기존 scrapeKATO() 호환성 유지
 */
export async function scrapeKATO(): Promise<CrawledTournamentV2[]> {
  return scrapeKATOList();
}
