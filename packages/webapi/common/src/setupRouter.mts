import catchAsyncErrors from "./catchAsyncErrors.mjs";
import fs from "fs";
import type { Express, IRouter, RequestHandler, Request as Req, Response as Resp, NextFunction } from "express";
import expressWs, { Application, WebsocketRequestHandler, WithWebsocketMethod } from "express-ws";
import { METHODS } from "http";
import { WeakExtensible } from "@thylacine-js/common/extensible.mjs";
import { RouteNode } from "./routing/RouteNode.mjs";

import nodePath from "path";
import { ApiRoute } from "./routing/ApiRoute.mjs";
import { StandardVerbs as Verbs } from "./Method.mjs";
import path from "path";

type Request = WeakExtensible<Req>;
type Response = WeakExtensible<Resp>;

function addHandler(
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

export async function addHandlersFrom(app: Express & { ws?: expressWs.WebsocketMethod<any> }, node: RouteNode) {
  if (node) {
    for (const route of node.children.values()) {
      {
        if (route instanceof RouteNode) {
          await addHandlersFrom(app, route);
        } else if (route instanceof ApiRoute) {
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
            addHandler(app, route.method, route.parameterizedPath, handler, ...(route.middleware as RequestHandler[]));
          }
        }
      }
    }
  }
}

export const HTTP_VERBS = [...METHODS, "all", "ws"];

export default async function setupRouter(
  app: Express & { ws?: expressWs.WebsocketMethod<any> },
  { appDir = process.cwd() } = {}
): Promise<RouteNode> {
  const tree = (await RouteNode.create("/", nodePath.join(appDir, "routes"))) as RouteNode;
  await addHandlersFrom(app, tree);
  return tree;
}
