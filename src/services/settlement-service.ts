import { executeQuery } from '../utils/db-connection'; 
import { FinalUserData } from '../interfaces/user-interface';
import { BetRequest } from '../interfaces/api-interface';

const SQL_INSERT_SETTLEMENT = `
  INSERT INTO settlement (
    round_id, user_id, operator_id, bet_amount, 
    player_choice, winning_result, win_amount
  ) VALUES (?, ?, ?, ?, ?, ?, ?)
`;
export const saveSettlementRecord = (
    roundId: string,
    userData: FinalUserData,
    betData: BetRequest,
    winningResult: 'heads' | 'tails',
    winAmount: number
): void => {
  try {
    const params = [
      roundId,
      userData.user_id,
      userData.operatorId,
      betData.betAmount,
      betData.choice,
      winningResult,
      winAmount
    ];

    executeQuery(SQL_INSERT_SETTLEMENT, params)
      .then(() => console.log(`[DB] Settlement record saved for round ${roundId}`))
      .catch(err => console.error(`[DB_ERROR] Failed to save settlement for round ${roundId}:`, err));

  } catch (error) {
    console.error("[DB_ERROR] Unexpected error preparing settlement data:", error);
  }
};