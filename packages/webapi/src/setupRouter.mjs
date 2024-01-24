import catchAsyncErrors from "./catchAsyncErrors.mjs";
import { globby } from "globby";

function appHandle(app, method, path, handler, ...middleware) {
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

const HTTP_VERBS = ["get", "post", "put", "delete", "patch", "all", "ws"];

async function findRoutes(appDir) {
  const r = [];
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

export default async function setupRouter(
  app,
  { appDir = process.cwd() } = {}
) {
  const routes = await findRoutes(appDir);
  for (const route of routes) {
    const [method, path] = route;
    const module = await import(
      `${appDir}/routes${path}${path.length === 1 ? "" : "/"}${method}.mjs`
    );
    if (method === "ws") {
      app.ws(path, module.default);
    } else {
      const handler = catchAsyncErrors(module.default);
      const middleware = module.middleware || [];
      appHandle(app, method, path, handler, ...middleware);
    }
  }
}
