import { Console } from "console";
import type { Logger as WinstonLogger } from "winston";
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

export function log(level: Level = Level.info) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      Logger.init()[level](propertyKey, ...args);
      return originalMethod.apply(this, args);
    };
    return descriptor;
  };
}

export type LoggerLike = Console | WinstonLogger | log4jsLogger | Logger;

export class Logger {
  _logger: Console | WinstonLogger | log4jsLogger;
  log: typeof Console.prototype.log;
  warn: typeof Console.prototype.warn;
  error: typeof Console.prototype.error;
  debug: typeof Console.prototype.debug;
  trace: typeof Console.prototype.trace;

  fatal: typeof Console.prototype.error;

  defaultLevel: Level;

  static _instance: Logger;

  static get instance() {
    return Logger._instance ?? Logger.init();
  }
  static init(logger: LoggerLike = console, defaultLevel: Level = Level.info) {
    if (logger instanceof Logger) {
      return (Logger._instance = logger);
    }
    return (Logger._instance = new Logger(logger, defaultLevel));
  }
  constructor(logger: Console | WinstonLogger | log4jsLogger = console, defaultLevel: Level = Level.info) {
    if (logger instanceof Console) {
      this.log = logger.log;
      this.warn = logger.warn;
      this.error = logger.error;
      this.debug = logger.debug;
      this.trace = logger.trace;
      this.fatal = logger.error;
    } else if (isWinstonLogger(logger)) {
      this.log = (message?: any, ...optionalParams: any[]) => logger.log(defaultLevel, message, ...optionalParams);
      this.warn = logger.warn;
      this.error = logger.error;
      this.debug = logger.debug;
      this.trace = (message?: any, ...optionalParams: any[]) => logger.log(Level.trace, message, ...optionalParams);
      this.fatal = (message?: any, ...optionalParams: any[]) => logger.log(Level.fatal, message, ...optionalParams);
    } else {
      this.log = logger.log;
      this.warn = logger.warn;
      this.error = logger.error;
      this.debug = logger.debug;
      this.trace = logger.trace;
      this.fatal = logger.fatal;
    }
  }
}
