import { Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { BetRequest } from '../interfaces/api-interface';
import { FinalUserData } from '../interfaces/user-interface';
import { CreditWebHookData } from '../interfaces/bet-interface';
import { apiClient } from '../config/api-client';
import { setCache } from '../utils/redis-connection';

const executeCreditAPI = async (creditPayload: CreditWebHookData, token: string): Promise<boolean> => {
  try {
    const response = await apiClient.post('/service/operator/user/balance/v2', creditPayload, {
      headers: { token },
    });
    return response.data?.status === true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
        console.error(' Axios Error:', error.response?.data || error.message);
    } else {
        console.error(' Error:', error);
    }
    return false;
  }
};

const processBetCredit = async (userData: FinalUserData, winAmt: number, roundId: string, debitTxnId: string) => {
  const creditPayload: CreditWebHookData = {
    txn_id: uuidv4(),
    user_id: userData.user_id,
    game_id: userData.game_id,
    txn_ref_id: debitTxnId,
    amount: winAmt.toFixed(2),
    description: `Winnings of ${winAmt.toFixed(2)} for Coin Flipper round ${roundId}`,
    txn_type: 1,
  };

  const isCreditSuccessful = await executeCreditAPI(creditPayload, userData.token);
  return { status: isCreditSuccessful };
};

const generateCoinFlipResult = (): 'heads' | 'tails' => {
  return Math.random() < 0.5 ? 'heads' : 'tails';
};

export const processBetResolution = async (
  socket: Socket,
  userData: FinalUserData,
  betData: BetRequest,
  roundId: string,
  debitTxnId: string
) => {
  const winningResult = generateCoinFlipResult(); 
  const playerChoice = betData.choice;
  const betAmount = betData.betAmount;

  socket.emit('round_result', {
    winningResult: winningResult,
    yourChoice: playerChoice,
    roundId: roundId,
  });

  if (playerChoice === winningResult) {
    const winAmt = betAmount * 2;
    console.log(`User ${userData.userId} won. Attempting to credit ${winAmt}.`);

    const creditResult = await processBetCredit(userData, winAmt, roundId, debitTxnId);

    if (creditResult.status) {
      userData.balance += winAmt;
      const redisKey = `PL:${socket.id}`;
      await setCache(redisKey, JSON.stringify(userData));

      console.log(`- GameService: Credit successful for ${userData.userId}. New balance: ${userData.balance}`);
      socket.emit('user_info', {
        user_id: userData.userId,
        operator_id: userData.operatorId,
        balance: userData.balance,
      });
    } else {
      console.error(` Credit failed for user ${userData.userId}, round ${roundId}`);
      socket.emit('error', { message: 'Winnings could not be credited' });
    }
  } else {
    console.log(`User ${userData.userId} lost the bet for round ${roundId}.`);
  }
};