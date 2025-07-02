// Defines user object structure used across user modules
export interface RawUserData {
    user_id: string;
    operatorId: string;
    balance: number;
};

export interface FinalUserData extends RawUserData {
    userId: string; 
    id: string;     
    game_id: string;
    token: string;
    image: number;
};