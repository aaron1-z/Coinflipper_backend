export interface AppConfig {
    port : number;
    serviceBaseUrl : string;
    redisUrl : string;
    minBetAmount : number;
    maxBetAmount: number;
    maxCashoutAmount: number;
}

/* export interface BetRequest {
    choice: 'heads' | 'tails';
    betAmount: number;
} */
export interface BetRequest {
    choice: 1 | 2;
    betAmount: number;
}