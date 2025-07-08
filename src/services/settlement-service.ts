import { executeQuery } from '../utils/db-connection'; 
import { FinalUserData } from '../interfaces/user-interface';
import { BetRequest } from '../interfaces/api-interface';
import {createLogger} from '../utils/logger';

const logger = createLogger('SettlementDB');

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
      .then(() => logger.info({roundId}, "Settlement record saved"))
      .catch(err => logger.error({error:err.message}, "Failed to save settlement record"));

  } catch (error) {
    logger.error({error}, "unexpected error");
  }
};