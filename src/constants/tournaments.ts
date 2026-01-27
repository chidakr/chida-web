/** 대회 목록 필터용 카테고리 (남/여/혼복/단식 등) */
export const CATEGORIES = [
  { id: 'all', label: '전체 보기', sub: [] as string[] },
  {
    id: 'men',
    label: '남자 복식',
    color: 'bg-blue-500',
    sub: ['오픈부', '전국신인부', '지역신인부', '초급자(1년미만)', '초급자(2년미만)', '초급자(3년미만)'],
  },
  {
    id: 'women',
    label: '여자 복식',
    color: 'bg-pink-500',
    sub: ['국화부', '개나리부', '초급자(1년미만)', '초급자(2년미만)', '초급자(3년미만)'],
  },
  {
    id: 'mixed',
    label: '혼합 복식',
    color: 'bg-purple-500',
    sub: ['혼복 오픈부', '혼복 신인부'],
  },
  {
    id: 'single',
    label: '단식',
    color: 'bg-green-500',
    sub: ['남자 단식', '여자 단식'],
  },
] as const;

/** 지역 필터 옵션 */
export const LOCATIONS = [
  '서울',
  '경기',
  '인천',
  '경기 광주',
  '강원',
  '대전',
  '세종',
  '충북',
  '충남',
  '부산',
  '대구',
  '울산',
  '경북',
  '경남',
  '전북',
  '광주',
  '전남',
  '제주',
] as const;

export type CategoryItem = (typeof CATEGORIES)[number];
export type CategoryId = CategoryItem['id'];
export type LocationOption = (typeof LOCATIONS)[number];
