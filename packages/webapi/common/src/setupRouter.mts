import catchAsyncErrors from "./catchAsyncErrors.mjs";

import type { Express, IRouter, RequestHandler, Request as Req, Response as Resp, NextFunction }  from 'express';
import expressWs, { Application, WithWebsocketMethod } from 'express-ws';
import { globby } from 'globby';
import { METHODS } from 'http';
import {WeakExtensible} from '@thylacine-js/common/extensible.mjs';

type Request = WeakExtensible<Req>
type Response = WeakExtensible<Resp>




function addHandler(app : IRouter, method: CanonicalMethod, path: string, handler: RequestHandler, ...middleware: RequestHandler[]) {
  app[method](
    path,
    (req : Request, res : Response, next: NextFunction) => {
      res.jsonCached = res.json;
      next();
    },
    ...middleware,
    handler
  );

}

type CanonicalMethod =  'get' | 'post' | 'put' | 'delete' | 'patch' | 'all' | 'ws';

const HTTP_VERBS = METHODS.concat("ws");



async function findRoutes(appDir: string) : Promise<any[][]> {
  const r : any[][] = [];
  const path_matchers = HTTP_VERBS.map(
    (verb) => `${appDir}/routes/**/${verb.toLowerCase()}.mjs`
  );
  const paths = await globby(path_matchers);
  for (const path of paths) {
    const m = path.match(`./routes(.*)/(.*).mjs`);
    if (m) {
      r.push([m[2], m[1]]);
    }
  }
  return r;
}

export default async function setupRouter(app : Express & {ws? : expressWs.WebsocketMethod<any>}, { appDir = process.cwd() } = {}) {
  const routes = await findRoutes(appDir);
  for (const route of routes) {
    const [method, path] = route;
    const module = await import(
      `${appDir}/routes${path}${
        path.length === 1 ? "" : "/"
      }${method}.mjs`
    )


    const middleware = module.middleware || [];

    if (method === 'ws')  {
      if(!app.ws)
      {
          expressWs(app);
          //TODO: pass WebSocket options
      }
      app.ws(path, ...middleware,module.default);
    } else {
      const handler = catchAsyncErrors(module.default);
      addHandler(app, method, path, handler, ...middleware);
    }
  }
}
