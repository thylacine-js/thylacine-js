export { Config } from "./config/Config.mjs";
import { Logger, logMethod, Level, LoggerLike } from "./logging/Logger.mjs";
export type { Extensible, WeakExtensible } from "./extensible.mjs";
// eslint-disable-next-line @typescript-eslint/prefer-namespace-keyword, @typescript-eslint/no-namespace
export const Logging = { Logger, logMethod, Level };
export type { LoggerLike };
import * as cliCalls from "./cliCalls.mjs";
export { cliCalls };

import { parseArgs } from "./cliCalls.mjs";
import * as dirnameFromImportMeta from "./dirnameFromImportMeta.mjs";
export const utils = { parseArgs, dirnameFromImportMeta };
