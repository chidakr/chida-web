-- ==========================================
-- tournament_divisions 테이블에 부서별 계좌 정보 추가
-- ==========================================
-- 목적: 부서별로 다른 입금 계좌 정보를 저장
-- ==========================================

DO $$
BEGIN
  -- 은행명
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tournament_divisions' AND column_name = 'account_bank'
  ) THEN
    ALTER TABLE tournament_divisions ADD COLUMN account_bank text;
    RAISE NOTICE '✅ account_bank 컬럼 추가 완료';
  END IF;

  -- 계좌번호
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tournament_divisions' AND column_name = 'account_number'
  ) THEN
    ALTER TABLE tournament_divisions ADD COLUMN account_number text;
    RAISE NOTICE '✅ account_number 컬럼 추가 완료';
  END IF;

  -- 예금주
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tournament_divisions' AND column_name = 'account_holder'
  ) THEN
    ALTER TABLE tournament_divisions ADD COLUMN account_holder text;
    RAISE NOTICE '✅ account_holder 컬럼 추가 완료';
  END IF;
END $$;

-- ==========================================
-- 완료 메시지
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE '✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨';
  RAISE NOTICE '🎉 부서별 계좌 정보 컬럼 추가 완료!';
  RAISE NOTICE '💰 추가된 컬럼: account_bank, account_number, account_holder';
  RAISE NOTICE '✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨';
END $$;

-- ==========================================
-- 예시 데이터
-- ==========================================
/*
-- 부서별 계좌 정보 업데이트 예시
UPDATE tournament_divisions
SET
  account_bank = '신한은행',
  account_number = '100-036-141864',
  account_holder = '인천광역시테니스협회'
WHERE name = '개나리부';
*/
