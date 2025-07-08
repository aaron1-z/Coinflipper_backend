import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: process.env.PORT || 3000,
    serviceBaseUrl : process.env.SERVICE_BASE_URL || '',
     amqpConnectionString: process.env.AMQP_CONNECTION_STRING || '',
     amqpExchangeName: process.env.AMQP_EXCHANGE_NAME || '',

     db: {
        host: process.env.DB_HOST || '',
        user: process.env.DB_USER || '',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || '',
        port: Number(process.env.DB_PORT) || 3306,
     }
};