import { Console } from "console";
import type { Logger as WinstonLogger } from "winston";
import type { Logger as log4jsLogger } from "log4js";
export declare enum Level {
    trace = "trace",
    debug = "debug",
    info = "info",
    warn = "warn",
    error = "error",
    fatal = "fatal"
}
export declare function logMethod(level?: Level): MethodDecorator;
export type LoggerLike = Console | WinstonLogger | log4jsLogger | Logger;
export declare class Logger {
    _logger: Console | WinstonLogger | log4jsLogger;
    readonly log: typeof Console.prototype.log;
    readonly warn: typeof Console.prototype.warn;
    readonly error: typeof Console.prototype.error;
    readonly debug: typeof Console.prototype.debug;
    readonly trace: typeof Console.prototype.trace;
    readonly info: typeof Console.prototype.info;
    readonly fatal: typeof Console.prototype.error;
    defaultLevel: Level;
    static _instance: Logger;
    static get instance(): Logger;
    static init(logger?: LoggerLike, defaultLevel?: Level): Logger;
    constructor(logger?: Console | WinstonLogger | log4jsLogger, defaultLevel?: Level);
}
