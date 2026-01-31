/**
 * 🚀 크롤러 실행 스크립트
 * 
 * 사용법:
 *   npm run crawl
 * 또는:
 *   npx ts-node scripts/crawl.ts
 */

import { runCrawler } from '../src/lib/crawler';

async function main() {
  try {
    await runCrawler();
    process.exit(0);
  } catch (error) {
    console.error('❌ 크롤러 실행 실패:', error);
    process.exit(1);
  }
}

main();
