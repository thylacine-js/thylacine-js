import { Console } from "console";
export var Level;
(function (Level) {
    Level["trace"] = "trace";
    Level["debug"] = "debug";
    Level["info"] = "info";
    Level["warn"] = "warn";
    Level["error"] = "error";
    Level["fatal"] = "fatal";
})(Level || (Level = {}));
function isWinstonLogger(logger) {
    return logger.silly !== undefined;
}
export function logMethod(level = Level.info) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            Logger.instance[level](`Calling method ${propertyKey} with args: ${JSON.stringify(args)}`);
            return originalMethod.apply(this, args);
        };
        return descriptor;
    };
}
export class Logger {
    _logger;
    log;
    warn;
    error;
    debug;
    trace;
    info;
    fatal;
    defaultLevel;
    static _instance;
    static get instance() {
        return Logger._instance ?? Logger.init();
    }
    static init(logger = console, defaultLevel = Level.info) {
        if (logger instanceof Logger) {
            Logger._instance = logger;
            return Logger._instance;
        }
        Logger._instance = new Logger(logger, defaultLevel);
        return Logger._instance;
    }
    constructor(logger = console, defaultLevel = Level.info) {
        if (logger instanceof Console) {
            this.log = logger.log;
            this.warn = logger.warn;
            this.error = logger.error;
            this.debug = logger.debug;
            this.trace = logger.trace;
            this.fatal = logger.error;
            this.info = logger.info;
        }
        else if (isWinstonLogger(logger)) {
            this.log = (message, ...optionalParams) => logger.log(defaultLevel, message, ...optionalParams);
            this.warn = logger.warn;
            this.error = logger.error;
            this.debug = logger.debug;
            this.trace = (message, ...optionalParams) => logger.log(Level.trace, message, ...optionalParams);
            this.fatal = (message, ...optionalParams) => logger.log(Level.fatal, message, ...optionalParams);
            this.info = logger.info;
        }
        else {
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
