import dotenvx from "@dotenvx/dotenvx";
import camelcase from "camelcase";
import dotenvExpand from "dotenv-expand";
import fs, { existsSync } from "fs";
import path from "path";
import { Get, Paths, Replace, SnakeCase } from "type-fest";

type ConfigOptions = {
  projectPath?: string;
  dotenv?: {
    parse?: dotenvx.DotenvParseOptions;
    config?: dotenvx.DotenvConfigOptions;
    expand?: dotenvExpand.DotenvExpandOptions;
  };
};

export namespace Config {
  type Options = Record<string, unknown>;
  export function init<TConfig extends Options>(options?: ConfigOptions): TConfig {
    if (!options || !options.dotenv.config.path) {
      const dotenv_fp = path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || "development"}`);
      if (existsSync(dotenv_fp)) {
        options.dotenv = options.dotenv || {};
        options.dotenv.config = { path: dotenv_fp };
      }
    }
    let env: dotenvx.DotenvConfigOutput;
    env = dotenvx.config(options.dotenv?.config);
    if (env.error) {
      throw env.error;
    }
    if (env.parsed) {
      let envxp = dotenvExpand.expand({ ...options.dotenv.expand, parsed: env.parsed });
      const c = {};

      for (const key in envxp.parsed) {
        c[camelcase(key, { pascalCase: true })] = envxp.parsed[key];
      }
      return c as TConfig;
    }
  }

  export function assign<TConfig extends Options>(config: TConfig, envVars: Env<TConfig>, override: true): TConfig {
    let newConfig = { ...config };
    for (const key in envVars) {
      if (envVars.hasOwnProperty(key)) {
        if (override || (newConfig as any)[camelcase(key, { pascalCase: true })] === undefined) {
          //@ts-ignore
          (newConfig as any)[camelcase(key, { pascalCase: true })] = envVars[key];
        }
      }
    }
    return newConfig as TConfig;
  }

  export function merge<TConfig extends Options>(baseConfig: TConfig, overrides: Partial<TConfig>): TConfig {
    return {
      ...baseConfig,
      ...overrides,
    };
  }

  export type Env<T extends Options> = {
    [x in Extract<Paths<T, { leavesOnly: true }>, string> as Uppercase<
      Replace<SnakeCase<`${x}`>, ".", "_", { all: true }>
    >]?: Get<T, x> | undefined;
  };

  export type EnvWithPrefix<T extends Record<string, unknown>, Prefix extends string> = {
    [x in Extract<Paths<T, { leavesOnly: true }>, string> as Uppercase<
      Replace<SnakeCase<`${Prefix}_${x}`>, ".", "_", { all: true }>
    >]?: Get<T, x> | undefined;
  };
}

export interface Configurable<TOptions extends Record<string, unknown>> {
  options: TOptions;
  constructor(options?: TOptions): void;
}
