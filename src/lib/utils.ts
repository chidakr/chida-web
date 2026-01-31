import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 장소 정보를 지역명과 상세 주소로 분리하는 함수
 * @param location - 지역명 (예: "경북", "서울")
 * @param locationDetail - 상세 주소 (예: "경북대학교테니스장, 유니버시아드테니스장")
 * @returns {region: string, detail: string}
 */
export function parseLocation(location?: string, locationDetail?: string) {
  // 지역 키워드 목록 (우선순위 순서: 긴 키워드부터)
  const REGION_KEYWORDS = [
    '경기 광주', // 먼저 체크 (광주와 구분)
    '서울', '경기', '인천', '강원',
    '대전', '세종', '충북', '충남',
    '부산', '대구', '울산', '경북', '경남',
    '전북', '광주', '전남', '제주'
  ];

  // location_detail이 있으면 location을 지역으로, location_detail을 상세 주소로 사용
  if (locationDetail) {
    // location이 없거나 지역 키워드가 아닌 경우, locationDetail에서 지역 추출 시도
    if (!location || !REGION_KEYWORDS.includes(location)) {
      const detectedRegion = REGION_KEYWORDS.find(keyword => locationDetail.includes(keyword));
      if (detectedRegion) {
        return {
          region: detectedRegion,
          detail: locationDetail
        };
      }
    }

    return {
      region: location || '미정',
      detail: locationDetail
    };
  }

  // location만 있을 때
  if (location) {
    // 1. 정확히 일치하는 지역 키워드가 있는지 확인
    const exactMatch = REGION_KEYWORDS.find(keyword => location === keyword);
    if (exactMatch) {
      return {
        region: exactMatch,
        detail: ''
      };
    }

    // 2. location에 지역 키워드가 포함되어 있는지 확인
    const detectedRegion = REGION_KEYWORDS.find(keyword => location.includes(keyword));
    if (detectedRegion) {
      // 지역명을 제외한 나머지를 상세 주소로
      const detail = location.replace(detectedRegion, '').trim();
      return {
        region: detectedRegion,
        detail: detail
      };
    }

    // 3. 지역 키워드를 못 찾으면 앞 2글자를 지역으로 추출 (fallback)
    if (location.length > 2) {
      return {
        region: location.substring(0, 2),
        detail: location.substring(2)
      };
    }

    // 4. location이 2글자 이하면 지역만 있는 것
    return {
      region: location,
      detail: ''
    };
  }

  return {
    region: '장소 미정',
    detail: ''
  };
}
