import { Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { BetRequest } from '../interfaces/api-interface';
import { FinalUserData } from '../interfaces/user-interface';
import { CreditWebHookData } from '../interfaces/bet-interface';
import { sendToQueue } from '../utils/amqp';
import { config } from '../config/env-config';
import { delay } from '../utils/helpers';
import { saveSettlementRecord } from './settlement-service';

const queueCreditTransaction = async (
    userData: FinalUserData,
    winAmt: number,
    roundId: string,
    debitTxnId: string
): Promise<CreditWebHookData | null> => {
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

        console.log("Preparing to queue credit transaction:", finalMessage);
        
        await sendToQueue(config.amqpExchangeName, "games_cashout", JSON.stringify(finalMessage));
        return creditPayload;

    } catch (error) {
        console.error(
            `Credit queueing failed for user ${userData.userId} in round ${roundId}`,
            { error }
        );
        return null;

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

  let winAmt = 0;

  let finalBalance = userData.balance;

  if (playerChoice === winningResult) {
    winAmt = betAmount * 2; 
    console.log(`User ${userData.userId} won. Attempting to credit ${winAmt}.`);

    await queueCreditTransaction(userData, winAmt, roundId, debitTxnId);
  
     finalBalance += winAmt;
    console.log(`Credit successful for ${userData.userId}. New balance: ${finalBalance}`);

   
  } else {
    console.log(`User ${userData.userId} lost the bet for round ${roundId}.`);
  }


  socket.emit('round_result', {
    winningResult: winningResult,
    yourChoice: playerChoice,
    roundId: roundId,
    winAmount: winAmt
  });

  await delay(2000);

    socket.emit('info', {
        user_id: userData.userId,
        operator_id: userData.operatorId,
        balance: finalBalance,
    });
    

 saveSettlementRecord(roundId, userData, betData, winningResult, winAmt);
};