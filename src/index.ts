import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { appConfig } from './utils/app-config';
import { intializeSocket } from './socket';
import { initializeRedis } from './utils/redis-connection';
import { initQueue } from './utils/amqp';
import { initializeDatabase } from './utils/db-connection'; 
import {createLogger} from './utils/logger';

const logger = createLogger('Server');

dotenv.config();
const PORT = appConfig.port;
const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

const startServer = async () => {
    try {
        await initializeRedis();
           await initQueue();
           await initializeDatabase() ;

        intializeSocket(io);
    
        httpServer.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });

    } catch (err) {
       logger.fatal({error:err}, 'Server failed to start');
        process.exit(1);
    }
};

startServer();