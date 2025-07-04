import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: process.env.PORT || 3000,
    serviceBaseUrl : process.env.SERVICE_BASE_URL || '',
     amqpConnectionString: process.env.AMQP_CONNECTION_STRING || '',
     amqpExchangeName: process.env.AMQP_EXCHANGE_NAME || '',
};