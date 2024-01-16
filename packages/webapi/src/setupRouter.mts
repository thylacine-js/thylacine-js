import catchAsyncErrors from "./catchAsyncErrors.mjs";

import  { Express }  from 'express';
import expressWs, { Application, WithWebsocketMethod } from 'express-ws';
import { globby } from 'globby';



function appHandle(app : Express, method: keyof typeof Verbs, path: string, handler: (...args: any[]) => any, ...middleware: any[]) {
  app[method](
    path,
    (req, res, next) => {
      res.jsonCached = res.json;
      next();
    },
    ...middleware,
    handler
  );
}

enum Verbs
{
  get = 'get',
  post = 'post',
  put = 'put',
  delete = 'delete',
  patch = 'patch',
  all = 'all',
  ws = 'ws'

}

const HTTP_VERBS = Object.values(Verbs);



async function findRoutes(appDir: string) : Promise<any[][]> {


  const r : any[][] = [];
  const path_matchers = HTTP_VERBS.map(
    (verb) => `${appDir}/routes/**/${verb}.mjs`
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

export default async function setupRouter(app : Express & { ws?: WithWebsocketMethod["ws"]}, { appDir = process.cwd() } = {}) {
  const routes = await findRoutes(appDir);
  for (const route of routes) {
    const [method, path] = route;
    const module = await import(
      `${appDir}/routes${path}${
        path.length === 1 ? "" : "/"
      }${method}.mjs`
    )

    if (method === Verbs.ws && app.ws)  {
      app.ws(path, module.default);
    } else {
      const handler = catchAsyncErrors(module.default);
      const middleware = module.middleware || [];
      appHandle(app, method, path, handler, ...middleware);
    }
  }
}
