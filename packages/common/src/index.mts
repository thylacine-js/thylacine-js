export { Config } from "@thylacine-js/config";
export type { Env } from "@thylacine-js/config";
export type { Extensible, WeakExtensible } from "./extensible.mjs";
export type { LoggerLike };
import { Level, Logger, LoggerLike, logMethod } from "@thylacine-js/logging";
import * as cliCalls from "./cliCalls.mjs";
// eslint-disable-next-line @typescript-eslint/prefer-namespace-keyword, @typescript-eslint/no-namespace
export const Logging = { Logger, logMethod, Level };
export { cliCalls };

import { parseArgs } from "./cliCalls.mjs";
import * as dirnameFromImportMeta from "./dirnameFromImportMeta.mjs";
export const utils = { parseArgs, dirnameFromImportMeta };
