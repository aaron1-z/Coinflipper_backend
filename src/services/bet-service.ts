import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { BetRequest } from '../interfaces/api-interface';
import { FinalUserData } from '../interfaces/user-interface';
import { DebitWebHookData, DebitResult } from '../interfaces/bet-interface';
import { apiClient } from '../config/api-client';

class BetService {
  private async _debitUserBalanceAPI(debitPayload: DebitWebHookData, token: string): Promise<boolean> {
    try {
      const response = await apiClient.post('/service/operator/user/balance/v2', debitPayload, {
        headers: { token },
      });
      return response.data?.status === true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(' Axios Error:', error.response?.data || error.message);
      } else {
        console.error('Error:', error);
      }
      return false;
    }
  }

  public async processBet(userData: FinalUserData, betData: BetRequest): Promise<DebitResult> {
    const betAmount = betData.betAmount;
    const roundId = uuidv4();
    const debitTxnId = uuidv4();
    const debitPayload: DebitWebHookData = {
      txn_id: debitTxnId,
      user_id: userData.user_id,
      game_id: userData.game_id,
      round_id: roundId,
      amount: betAmount.toFixed(2),
      description: `Bet of ${betAmount.toFixed(2)} on ${betData.choice} for Coin Flipper round ${roundId}`,
      txn_type: 0,
    };
    

    const isDebitSuccessful = await this._debitUserBalanceAPI(debitPayload, userData.token);

    if (isDebitSuccessful) {
      return {
        status: true,
        roundId: roundId,
        debitTxnId: debitTxnId,
      };
    } else {
      return {
        status: false,
        message: 'Transaction declined by payment server.',
      };
    }
  }
}

export const betService = new BetService();