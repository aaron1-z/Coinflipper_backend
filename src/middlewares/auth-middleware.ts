import {Socket} from 'socket.io';
export const verifySocketAuth = (socket : Socket, next:(err?:Error)=> void)=>{
    const{token, game_id} = socket.handshake.query;

    if(!token || !game_id) {
        return next(new Error('Missing token'));
    }
    next();
};
