import catchAsyncErrors from "./catchAsyncErrors.mjs";
import fs from "fs";
import type { Express, RequestHandler, Request as Req, Response as Resp, NextFunction } from "express";
import expressWs, { WebsocketRequestHandler } from "express-ws";
import { METHODS } from "http";
import { WeakExtensible } from "@thylacine-js/common";
import { RouteNode } from "./routing/RouteNode.mjs";

import nodePath from "path";
import { ApiRoute } from "./routing/ApiRoute.mjs";
import { StandardVerbs as Verbs } from "./Method.mjs";
import { Logging } from "@thylacine-js/common";
type Request = WeakExtensible<Req>;
type Response = WeakExtensible<Resp>;

class RouteManager {
  @Logging.logMethod()
  static addHandler(
    app: Express,
    method: string,
    path: string,
    handler: RequestHandler,
    ...middleware: RequestHandler[]
  ) {
    if (method === Verbs.use) {
      app.use(path, handler, ...middleware);
    }
    app[method](
      path,
      (req: Request, res: Response, next: NextFunction) => {
        res.jsonCached = res.json;
        res.json;
        next();
      },
      ...middleware,
      handler
    );
  }
  //TODO: Simplify logic here
  static async addHandlersFrom(app: Express & { ws?: expressWs.WebsocketMethod<any> }, node: RouteNode) {
    const children = Array.from(node.children?.values() || [node]);

    for (const route of children
      .filter((p): p is ApiRoute<any> => p instanceof ApiRoute)
      .sort(
        (a, b) => a.filePath.replace("use.mjs", "").length - b.filePath.replace("use.mjs", "").length
      ) /* shortest first prioritize 'use' over other methods */) {
      if (route.method === Verbs.ws) {
        if (!app.ws) {
          expressWs(app);
          //TODO: pass WebSocket options
        }
        app.ws(
          route.path,
          ...(route.middleware as WebsocketRequestHandler[]),
          route.handler as WebsocketRequestHandler
        );
      } else {
        const handler = catchAsyncErrors(route.handler as RequestHandler);
        RouteManager.addHandler(
          app,
          route.method,
          route.parameterizedPath,
          handler,
          ...(route.middleware as RequestHandler[])
        );
      }
    }
    for (const route of children.filter((p): p is RouteNode => p instanceof RouteNode)) {
      await this.addHandlersFrom(app, route);
    }
  }
}

export const HTTP_VERBS = [...METHODS, "all", "ws"];

export async function mountRoutes(
  app: Express & { ws?: expressWs.WebsocketMethod<any> },
  { appDir = process.cwd() } = {}
): Promise<RouteNode> {
  const tree = (await RouteNode.create("/", nodePath.join(appDir, "routes"))) as RouteNode;
  await RouteManager.addHandlersFrom(app, tree);
  return tree;
}
