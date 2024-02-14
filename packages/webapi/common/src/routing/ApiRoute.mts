/* eslint-disable @typescript-eslint/no-unused-vars */
import { RequestHandler, Request } from "express";

import { Config, appendToStartIfAbsent, trimStart } from "../config.mjs";
import { WebsocketRequestHandler } from "express-ws";
import { METHODS } from "node:http";
import { Extensible } from "@thylacine-js/common/extensible.mjs";

import camelCase from "lodash/camelCase.js";
import { statSync } from "node:fs";

import _ from "lodash";
import { RouteNode } from "./RouteNode.mjs";
import { StandardVerbs } from "../Method.mjs";

export type Verbs = StandardVerbs | string;

const PathExp = new RegExp(`(.*)${Config.ROUTE_ROOT}(.*)/(.*).mjs`);

export const ParamsExp = /\[(\w+)\]/g;

export class ApiRoute<THandler extends RequestHandler | WebsocketRequestHandler> {
  public readonly method: string;
  public readonly path: string;

  public readonly filePath: string;

  public handler: THandler;

  public readonly middleware: THandler[];

  public readonly subPath: string;

  static routeMap = new Map<string, RequestHandler | WebsocketRequestHandler>();

  public operation: string;
  parent: RouteNode;

  params: { [x: string]: string };

  private _templatePath: any;
  private _interpolatedPath: any;
  public get parameterizedPath(): any {
    if (!this._templatePath) {
      this._templatePath = this.path;
      for (const key in this.params) {
        this._templatePath = this._templatePath.replace(`[${key}]`, `:${key}`);
      }
      //this._templatePath = this.path.replace(ParamsExp, ":$1");
    }
    return this._templatePath;
  }

  public get interpolatedPath(): any {
    if (!this._interpolatedPath) {
      this._interpolatedPath = this.path;
      for (const key in this.params) {
        this._interpolatedPath = this._interpolatedPath.replace(`[${key}]`, `\${${key}}`);
      }
      //this._templatePath = this.path.replace(ParamsExp, ":$1");
    }
    return this._interpolatedPath;
  }

  stringify(): string {
    return JSON.stringify({
      method: this.method,
      path: this.path,
      operation: this.operation,
      subPath: this.subPath,
      parameterizedPath: this.parameterizedPath,
      interpolatedPath: this.interpolatedPath,
      filePath: this.filePath,
      handler: this.handler.name,
      params: this.params,
      middleware: this.middleware.map((m) => m.name),
    });
  }

  public static async create(
    path: string,
    parent: RouteNode
  ): Promise<ApiRoute<RequestHandler | WebsocketRequestHandler>> {
    const m = path.match(PathExp);

    if (m) {
      let handler = null;
      let middleware = [];
      const method = m[3].toLowerCase() as Verbs;
      const route = appendToStartIfAbsent(m[2], "/");
      let r = null;

      if (!Config.HOT_RELOAD) {
        const module = await import(path);
        handler = module.default;
        middleware = module.middleware || [];
      } else {
        const module = await import(path);
        this.routeMap[path] = module.default;
        // NOTE: if middleware changes, dev needs to restart
        // TODO reload on changes in middleware export
        middleware = module.middleware || [];
        handler = async (req: Request, res, next) => {
          const mtime = statSync(path).mtime.getTime();
          const module = await import(`file://${path}?MTIME=${mtime}`);
          return module.default(req, res, next);
        };
      }
      if (method !== StandardVerbs.ws) {
        r = new ApiRoute<RequestHandler>(method, route, path, handler, middleware, parent);
      } else {
        r = new ApiRoute<WebsocketRequestHandler>(method, route, path, handler, middleware, parent);
      }
      return r;
    }
    throw new Error(`Invalid path ${path}`);
  }

  private constructor(
    method: Verbs,
    route: string,
    path: string,
    handler: THandler,
    middleware: THandler[],
    parent: RouteNode
  ) {
    this.filePath = path;
    this.path = route;
    this.method = method;
    this.handler = handler;
    this.middleware = middleware;
    this.parent = parent;
    this.subPath = trimStart(route.replace(parent?.path ?? "", ""), "/");
    //this.params = { ...parent?.params, [this.subPath.match(ParamsExp)[0]]: "string" };
    this.operation = this.handler.name !== "default" ? this.handler.name : camelCase(`${this.method}_${this.path}`);
    let s;

    this.params = { ...parent?.params };
    while ((s = ParamsExp.exec(this.subPath)) !== null) {
      // console.log(`Found param ${s[1]} in ${this.subPath}`);
      this.params[s[1]] = "string";
    }
  }
}
