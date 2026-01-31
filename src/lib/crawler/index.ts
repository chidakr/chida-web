/**
 * 🕷️ 크롤러 메인 실행 파일 (v2.0)
 * 사용법: node -r ts-node/register src/lib/crawler/index.ts
 */

import { scrapeKATO } from './kato-scraper';
import { insertTournamentsV2 } from './db-inserter';

async function main() {
  console.log('🚀 크롤러 시작...\n');
  console.log('================================================');
  console.log('📅 실행 시각:', new Date().toLocaleString('ko-KR'));
  console.log('================================================\n');

  try {
    // 1. KATO 사이트 크롤링
    const tournaments = await scrapeKATO();

    if (tournaments.length === 0) {
      console.log('⚠️  크롤링된 데이터가 없습니다.');
      return;
    }

    console.log(`\n📊 크롤링 결과: ${tournaments.length}건\n`);

    // 2. DB에 저장
    const result = await insertTournamentsV2(tournaments);

    console.log('\n================================================');
    console.log('✅ 크롤러 완료!');
    console.log('================================================');
    console.log(`📊 총 ${result.total}건 처리`);
    console.log(`   ✅ 성공: ${result.success}건`);
    console.log(`   ⏭️  중복 스킵: ${result.skipped}건`);
    console.log(`   ❌ 실패: ${result.failed}건`);
    console.log('================================================\n');

    // 3. 상세 결과 출력 (실패만)
    if (result.failed > 0) {
      console.log('\n❌ 실패 내역:');
      result.results
        .filter(r => !r.success && !r.message.includes('중복'))
        .forEach(r => {
          console.log(`   - ${r.title}: ${r.message}`);
        });
    }

  } catch (error) {
    console.error('\n❌ 크롤러 실행 오류:', error);
    process.exit(1);
  }
}

// 실행
if (require.main === module) {
  main();
}

export { main as runCrawler };
