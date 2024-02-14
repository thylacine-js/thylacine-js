export { Config } from "./config/Config.mjs";
import { Logger, LoggerLike, Level,log } from "./logging/Logger.mjs";

// eslint-disable-next-line @typescript-eslint/prefer-namespace-keyword, @typescript-eslint/no-namespace
declare module Logging {
  export { Logger, LoggerLike, Level, log };
}

export { Logging };
