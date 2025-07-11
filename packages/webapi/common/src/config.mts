import { Config } from "@thylacine-js/config";

/* export class ConfigA extends Config {
  public static init(projectPath?: string): void {
    super.init(projectPath);
  }

  static _ROUTE_ROOT: string;
  public static get ROUTE_ROOT(): string {
    return (
      ConfigA._ROUTE_ROOT ??
      trimEnd(appendToStartIfAbsent((ConfigA._ROUTE_ROOT = process.env.ROUTE_ROOT ?? "/routes"), "/"), "/")
    );
  }

  public static get LAZY_LOAD(): boolean {
    return Boolean(process.env.LAZY_LOAD ?? false);
  }
  static _HOT_RELOAD: boolean;
  public static get HOT_RELOAD(): boolean {
    return (
      this._HOT_RELOAD ?? (this._HOT_RELOAD = Boolean(process.env.HOT_RELOAD ?? process.env.NODE_ENV === "development"))
    );
  }
} */

export default Config.init<{ hotReload: boolean; routeRoot: string; lazyLoad: boolean }>({
  projectPath: process.cwd(),
});

export function appendToEndIfAbsent(input = "", decorator: string): string {
  return input.endsWith(decorator) ? input : input + decorator;
}

export function trimEnd(input = "", decorator: string): string {
  return input.endsWith(decorator) ? input.slice(0, -decorator.length) : input;
}

export function trimStart(input = "", decorator: string): string {
  return input.startsWith(decorator) ? input.slice(decorator.length) : input;
}

export function appendToStartIfAbsent(input = "", decorator: string): string {
  return input.startsWith(decorator) ? input : decorator + input;
}

export function surroundWithIfAbsent(input = "", decorator: string): string {
  return appendToStartIfAbsent(appendToEndIfAbsent(input, decorator), decorator);
}
