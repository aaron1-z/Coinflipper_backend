import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: process.env.PORT || 3000,
    serviceBaseUrl : process.env.SERVICE_BASE_URL || '',
     amqpConnectionString: process.env.AMQP_CONNECTION_STRING || '',
     amqpExchangeName: process.env.AMQP_EXCHANGE_NAME || '',

     db: {
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'Aaron12@',
        database: process.env.DB_NAME || 'coin_flipper_db',
        port: Number(process.env.DB_PORT) || 3306,
     }
};