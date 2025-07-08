import { Socket } from 'socket.io';
import { BetRequest } from '../interfaces/api-interface';
import { FinalUserData } from '../interfaces/user-interface';
import { getCache, setCache } from '../utils/redis-connection';
import { betService } from '../services/bet-service';
import { BetResolution } from '../services/game-service';
import { createLogger } from '../utils/logger';

const logger = createLogger('BetController');

export const placeBetController = async (socket: Socket, betData: BetRequest) => {
  const redisKey = `PL:${socket.id}`;

  try {
    const userSessionString = await getCache(redisKey);
    if (!userSessionString) {
      return socket.emit('bet_error', { message: 'Session expired. Please reconnect.' });
    }
    const userData: FinalUserData = JSON.parse(userSessionString);
    if (!betData?.betAmount || typeof betData.betAmount !== 'number' || betData.betAmount <= 0) {
      return socket.emit('bet_error', { message: 'Invalid bet amount.' });
    }
    const betAmount = betData.betAmount;
    const validChoices = ['heads', 'tails'];
    
    if (!betData.choice || !validChoices.includes(betData.choice)) {
      logger.error({ 
          userId: userData.userId, 
          choice: betData.choice 
        }, 'Invalid choice received from user.');
      return socket.emit('bet_error', { message: "Invalid choice. Please select 'heads' or 'tails'." });
    }
    if (userData.balance < betAmount) {
      return socket.emit('bet_error', { message: 'Insufficient balance.' });
    }
    
    const debitResult = await betService.processBet(userData, betData);

    if (debitResult.status) {
      userData.balance -= betAmount;
      await setCache(redisKey, JSON.stringify(userData));

      logger.info({
          userId: userData.userId,
          roundId: debitResult.roundId
        }, 'Bet successful and debited.');
      
      socket.emit('info', {
        user_id: userData.userId,
        operator_id: userData.operatorId,
        balance: userData.balance,
      });

      await BetResolution(socket, userData, betData, debitResult.roundId, debitResult.debitTxnId);

    } else {
      return socket.emit('bet_error', { message: debitResult.message }); 
    }
  } catch (error: any) {

    logger.error({
        socketId: socket.id,
        error: error.message
      }, 'Unhandled exception in bet controller.');
    return socket.emit('bet_error', { message: 'An internal server error occurred.' });
  }
};