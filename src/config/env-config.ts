import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: process.env.PORT || 3000,
    serviceBaseUrl : process.env.SERVICE_BASE_URL || '',
};