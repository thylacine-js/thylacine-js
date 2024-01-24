export class Config {
  static _ROUTE_ROOT: string;
  public static get ROUTE_ROOT(): string {
    return (
      Config._ROUTE_ROOT ??
      trimEnd(
        appendToStartIfAbsent(
          (Config._ROUTE_ROOT = process.env.ROUTE_ROOT ?? "/routes"),
          "/"
        ),
        "/"
      )
    );
  }

  public static get LAZY_LOAD(): boolean {
    return Boolean(process.env.LAZY_LOAD ?? false);
  }
  static _HOT_RELOAD: boolean;
  public static get HOT_RELOAD(): boolean {
    return (
      this._HOT_RELOAD ??
      (this._HOT_RELOAD = Boolean(
        process.env.HOT_RELOAD ?? process.env.NODE_ENV === "development"
      ))
    );
  }
}

export function appendToEndIfAbsent(
  input: string = "",
  decorator: string
): string {
  return input.endsWith(decorator) ? input : input + decorator;
}

export function trimEnd(input: string = "", decorator: string): string {
  return input.endsWith(decorator) ? input.slice(0, -decorator.length) : input;
}

export function trimStart(input: string = "", decorator: string): string {
  return input.startsWith(decorator) ? input.slice(decorator.length) : input;
}

export function appendToStartIfAbsent(
  input: string = "",
  decorator: string
): string {
  return input.startsWith(decorator) ? input : decorator + input;
}

export function surroundWithIfAbsent(
  input: string = "",
  decorator: string
): string {
  return appendToStartIfAbsent(
    appendToEndIfAbsent(input, decorator),
    decorator
  );
}
