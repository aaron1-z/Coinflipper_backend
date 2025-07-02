//Types for requests/responses from external APIs

export interface AppConfig {
    port : number;
    serviceBaseUrl : string;
    redisUrl : string;
    minBetAmount : number;
    maxBetAmount: number;
    maxCashoutAmount: number;
}

export interface BetRequest {
    choice: 'heads' | 'tails';
    betAmount: number;
}