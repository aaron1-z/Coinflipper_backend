import { Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { BetRequest } from '../interfaces/api-interface';
import { FinalUserData } from '../interfaces/user-interface';
import { CreditWebHookData } from '../interfaces/bet-interface';
import { apiClient } from '../config/api-client';
import { setCache } from '../utils/redis-connection';
import { sendToQueue } from '../utils/amqp';
import {config} from '../config/env-config';

const queueCreditTransaction = async (
    userData: FinalUserData,
    winAmt: number,
    roundId: string,
    debitTxnId:string
): Promise<void> => {
    try {
        const creditPayload: CreditWebHookData = {
            txn_id: uuidv4(),
            user_id: userData.user_id,
            game_id: userData.game_id,
            txn_ref_id: debitTxnId,
            amount: winAmt.toFixed(2),
            description: `Winnings of ${winAmt.toFixed(2)} for Coin Flipper round ${roundId}`,
            txn_type: 1,
        };

        const finalMessage = {
            ...creditPayload,
            operatorId: userData.operatorId,
            token: userData.token,
        };

        console.log(finalMessage);
        
         await sendToQueue(config.amqpExchangeName, "games_cashout", JSON.stringify(finalMessage));


    } catch (error) {
        console.error(
            `credit failed for user ${userData.userId} in round ${roundId}`,
            { error }
        );
    }
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

     await queueCreditTransaction(userData, winAmt, roundId, debitTxnId);

    const FinalBalance = userData.balance + winAmt;
    console.log(`Credit successful for ${userData.userId}. New balance: ${FinalBalance}`);

      socket.emit('user_info', {
        user_id: userData.userId,
        operator_id: userData.operatorId,
        balance: FinalBalance,
      });
    
  } else {
    console.log(`User ${userData.userId} lost the bet for round ${roundId}.`);
  }

};