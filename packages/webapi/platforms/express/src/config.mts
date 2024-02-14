import { Config as ConfigBase } from "@thylacine-js/webapi-common";

export class Config extends ConfigBase {
  public static init(projectPath?: string): void {
    super.init(projectPath);
  }
  static _API_ORIGIN: URL;

  public static get API_ORIGIN(): URL {
    return Config._API_ORIGIN ?? (Config._API_ORIGIN = process.env.API_ORIGIN ? new URL(process.env.API_ORIGIN) : null);
  }

  static _API_PORT: number;

  public static get API_PORT(): number {
    return Config._API_PORT ?? (Config._API_PORT = Number(process.env.API_PORT));
  }

  static _API_DOMAIN: string;

  public static get API_DOMAIN(): string {
    return Config._API_DOMAIN ?? (Config._API_DOMAIN = process.env.API_DOMAIN ?? "localhost");
  }

  static _API_PROTOCOL: "http" | "https";

  //
  public static get API_PROTOCOL(): "http" | "https" {
    return Config._API_PROTOCOL ?? (Config._API_PROTOCOL = (process.env.API_PROTOCOL as "http" | "https") ?? "https");
  }

  static _COOKIE_DOMAIN: string;

  public static get COOKIE_DOMAIN(): string {
    return Config._COOKIE_DOMAIN ?? (Config._COOKIE_DOMAIN = process.env.COOKIE_DOMAIN);
  }

  static _COOKIE_SECRET: string;

  public static get COOKIE_SECRET(): string {
    return Config._COOKIE_SECRET ?? (Config._COOKIE_SECRET = process.env.COOKIE_SECRET ?? "WARNING_YOU_MUST_SET_THIS");
  }

  static _COOKIE_NAME: string;

  public static get COOKIE_NAME(): string {
    return Config._COOKIE_NAME ?? (Config._COOKIE_NAME = process.env.COOKIE_NAME ?? "session");
  }
}
