export const Bet_choice_map = {
  1: 'heads',
  2: 'tails'
};

export type BetChoice = 1 | 2;

export interface UserBet {
    amount : number;
    choice : 'heads' | 'tails' ;
}

export interface BetTransaction {
    userId : string;
    operatorId : string;
    lobbyId : string;
    totalBetAmount : number;
    userBets : UserBet; 
}

export interface DebitWebHookData {
  txn_id : string; 
  user_id : string;
  game_id: string;
  round_id: string;
  amount: string;
  description: string;
  txn_type: 0;
}

export interface CreditWebHookData {
    txn_id: string;
    user_id: string;
    game_id: string;
    txn_ref_id:string;
    amount: string;
    description:string;
    txn_type: 1;
}
interface DebitSuccessResult {
  status: true; 
  roundId: string;
  debitTxnId: string;
}

interface DebitFailureResult {
  status: false; 
  message: string;
}
export type DebitResult = DebitSuccessResult | DebitFailureResult;