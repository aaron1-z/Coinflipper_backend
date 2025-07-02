import { Server, Socket } from 'socket.io';
import { verifySocketAuth } from './middlewares/auth-middleware';
import { registerSocketEvents } from './routes/event-router';
import { getUserDataFromSource } from './services/user-service';
import { FinalUserData } from './interfaces/user-interface';
import{setCache, deleteCache} from './utils/redis-connection';

export const intializeSocket = (io: Server) => {
    io.use(verifySocketAuth);

    io.on('connection', async (socket: Socket) => {
        console.log(`Connection attempt: ${socket.id}`);

        try {
            const token = socket.handshake.query.token as string;
            const game_id = socket.handshake.query.game_id as string;

            const userData = await getUserDataFromSource(token, game_id);
            if (!userData) {
                console.log(`Auth failed: ${socket.id}`);
                socket.emit('auth_error', { message: 'Authentication failed.' });
                socket.disconnect(true);
                return;
            }

            socket.data.user = userData;
            console.log(`Auth success: User ${userData.userId} -> Socket ${socket.id}`);

            const redisKey = `PL:${socket.id}`;
            console.log(`key:${redisKey}`);
            await setCache(redisKey, JSON.stringify(userData));
            console.log(`session cached in Redis`); 
            
            socket.emit('user_info', {
                user_id: userData.userId,
                operator_id: userData.operatorId,
                balance: userData.balance,
                image: userData.image,
            });

            registerSocketEvents(socket);

            socket.on('disconnect', () => {
                console.log(`Disconnected: ${socket.id}`);
                deleteCache(redisKey);
                console.log(`key deleted`);

            });

        } catch (err) {
            console.error(`Error on connection`);
            socket.emit('auth_error', { message: 'Internal server error.' });
            socket.disconnect(true);
        }
    });
};