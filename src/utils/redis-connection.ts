import Redis from "ioredis";
import type { Redis as RedisClient } from "ioredis";
import { appConfig } from "./app-config";
import dotenv from 'dotenv';
dotenv.config();

let redisClient: RedisClient | null = null;

const MAX_CONNECTION_RETRIES = 5;
const RETRY_INTERVAL_MS = 2000;

export const initializeRedis = async (): Promise<void> => {
  let retries = 0;

  while (retries < MAX_CONNECTION_RETRIES) {
    try {
      redisClient = new Redis(appConfig.redisUrl);
      console.log(`Attempting Redis connection (Attempt ${retries + 1}/${MAX_CONNECTION_RETRIES})`);

      await redisClient.ping();
      console.log("Redis connection successful");
      return;
    } catch (err) {
      console.error(`Connection attempt ${retries + 1} failed:`, err.message);
      retries++;

      if (retries >= MAX_CONNECTION_RETRIES) {
        console.error("Max retries reached");
        process.exit(1);
      }

      await new Promise((res) => setTimeout(res, RETRY_INTERVAL_MS));
    }
  }
};

export const getClient = (): RedisClient => {
    if(!redisClient) {
        throw new Error("Redis client not intialised");
    }
    return redisClient;

};

export const setCache = async(key:string, value:string, 
    expirationInSeconds:number = 3600*16):Promise<void> => {
        try {
            const client = getClient();
            await client.set(key,value, 'EX',
                expirationInSeconds);
            
        } catch(error) {
            console.error(`Failed to set cache`, error.message);

        }

    };

    export const getCache = async (key: string): Promise<string | null> => {
    try {
        const client = getClient();
        return await client.get(key);
    } catch (error: any) {
        console.error(`Failed to get cache for key`, error.message);
        return null;
    }
}

export const deleteCache = async (key: string): Promise<void> => {
    try {
        const client = getClient();
        await client.del(key);
    } catch (error: any) {
        console.error(`Failed to delete cache for key "${key}":`, error.message);
    }
}