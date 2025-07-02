import { Socket } from 'socket.io';
import { placeBetController } from '../controllers/bet-controller';
import { BetRequest } from '../interfaces/api-interface'; 

export const registerSocketEvents = (socket: Socket) => {
    socket.on('bet', (data: BetRequest) => placeBetController(socket, data));
};
