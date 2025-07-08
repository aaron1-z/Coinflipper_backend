export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' ;

export interface LogEntry {
    level: LogLevel;
    time: number;
    name: string;
    msg: string;
    [key:string]: unknown;
}