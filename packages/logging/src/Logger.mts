import { Console } from "console";
import type { Logger as WinstonLogger, loggers } from "winston";
import type { Logger as log4jsLogger } from "log4js";

export enum Level {
  trace = "trace",
  debug = "debug",
  info = "info",
  warn = "warn",
  error = "error",
  fatal = "fatal",
}

function isWinstonLogger(logger: Console | WinstonLogger | log4jsLogger): logger is WinstonLogger {
  return (logger as WinstonLogger).silly !== undefined;
}

export function logMethod(level: Level = Level.info): MethodDecorator {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      Logger.instance[level](`Calling method ${propertyKey} with args: ${JSON.stringify(args)}`);
      return originalMethod.apply(this, args);
    };
    return descriptor;
  };
}

export type LoggerLike = Console | WinstonLogger | log4jsLogger | Logger;

export class Logger {
  _logger: Console | WinstonLogger | log4jsLogger;
  public readonly log: typeof Console.prototype.log;
  public readonly warn: typeof Console.prototype.warn;
  public readonly error: typeof Console.prototype.error;
  public readonly debug: typeof Console.prototype.debug;
  public readonly trace: typeof Console.prototype.trace;

  public readonly info: typeof Console.prototype.info;

  public readonly fatal: typeof Console.prototype.error;

  defaultLevel: Level;

  static _instance: Logger;

  static get instance() {
    return Logger._instance ?? Logger.init();
  }

  static init(logger: LoggerLike = console, defaultLevel: Level = Level.info) {
    if (logger instanceof Logger) {
      Logger._instance = logger;
      return Logger._instance;
    }
    Logger._instance = new Logger(logger, defaultLevel);
    return Logger._instance;
  }
  constructor(logger: Console | WinstonLogger | log4jsLogger = console, defaultLevel: Level = Level.info) {
    if (logger instanceof Console) {
      this.log = logger.log;
      this.warn = logger.warn;
      this.error = logger.error;
      this.debug = logger.debug;
      this.trace = logger.trace;
      this.fatal = logger.error;
      this.info = logger.info;
    } else if (isWinstonLogger(logger)) {
      this.log = (message?: any, ...optionalParams: any[]) => logger.log(defaultLevel, message, ...optionalParams);
      this.warn = logger.warn;
      this.error = logger.error;
      this.debug = logger.debug;
      this.trace = (message?: any, ...optionalParams: any[]) => logger.log(Level.trace, message, ...optionalParams);
      this.fatal = (message?: any, ...optionalParams: any[]) => logger.log(Level.fatal, message, ...optionalParams);
      this.info = logger.info;
    } else {
      this.log = logger.log;
      this.warn = logger.warn;
      this.error = logger.error;
      this.debug = logger.debug;
      this.trace = logger.trace;
      this.fatal = logger.fatal;
      this.info = logger.info;
    }
    this._logger = logger;
  }
}
