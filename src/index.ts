import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { appConfig } from './utils/app-config';
import { intializeSocket } from './socket';
import { initializeRedis } from './utils/redis-connection';
import { initQueue } from './utils/amqp';
import { initializeDatabase } from './utils/db-connection'; 

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
            console.log(`Server running on port ${PORT}`);
        });

    } catch (err) {
        console.error(' Server failed to start:', err);
        process.exit(1);
    }
};

startServer();