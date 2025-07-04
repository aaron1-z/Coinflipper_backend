import dotenv from 'dotenv';
import { AppConfig } from '../interfaces/api-interface';
dotenv.config();

function requireEnv(name:string):
string {
    const value = process.env[name];
    if(!value) {
        throw new Error(`Environment variable ${name} is required but not defined.`);
    }
    return value;
}

function requireNumberEnv(name:string): number {
    const value = requireEnv(name);
    const num = Number(value);
    if(isNaN(num)){
        throw new Error(`Environment variable ${name} must be a valid number. Received"${value}"`);
    }
    return num;

}
export const appConfig: AppConfig = {
    port: requireNumberEnv("PORT"),
    serviceBaseUrl:
    requireEnv("Service_BASE_URL"),
    redisUrl: requireEnv("REDIS_URL"),
    minBetAmount:
    requireNumberEnv("MIN_BET_AMOUNT"),
    maxBetAmount:
    requireNumberEnv("MAX_BET_AMOUNT"),
    maxCashoutAmount:
    requireNumberEnv("MAX_CASHOUT"),
};
