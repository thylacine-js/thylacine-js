import catchAsyncErrors from "./catchAsyncErrors.mjs";
import fs from 'fs';
import type { Express, IRouter, RequestHandler, Request as Req, Response as Resp, NextFunction } from 'express';
import expressWs, { Application, WebsocketRequestHandler, WithWebsocketMethod } from 'express-ws';
import { globby } from 'globby';
import { METHODS } from 'http';
import { WeakExtensible } from '@thylacine-js/common/extensible.mjs';
import { Config } from './config.mjs';
import { ApiRoute, CanonicalMethod, HttpMethod } from './apiRoute.mjs';

import ts from 'typescript';


type Request = WeakExtensible<Req>;
type Response = WeakExtensible<Resp>;



function addHandler(app: IRouter, method: HttpMethod, path: string, handler: RequestHandler, ...middleware: RequestHandler[]) {
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



const HTTP_VERBS = METHODS.concat("ws");



async function findRoutes(appDir: string): Promise<ApiRoute<RequestHandler | WebsocketRequestHandler>[]> {
  const r = [];
  const path_matchers = HTTP_VERBS.map(
    (verb) => `${appDir}/${Config.ROUTE_ROOT}/**/${verb.toLowerCase()}.mjs`
  );
  const paths = await globby(path_matchers);
  for (const path of paths) {

    r.push(await ApiRoute.create(path));
  }
  return r;
}

export default async function setupRouter(app: Express & { ws?: expressWs.WebsocketMethod<any>; }, { appDir = process.cwd() } = {}) {
  const routes = await findRoutes(appDir);
  for (const route of routes) {
    {
      if (route.method === CanonicalMethod.ws) {

        if (!app.ws) {
          expressWs(app);
          //TODO: pass WebSocket options
        }
        app.ws(route.path, ...route.middleware as WebsocketRequestHandler[], route.handler as WebsocketRequestHandler);
      } else {
        const handler = catchAsyncErrors(route.handler as RequestHandler);
        addHandler(app, route.method, route.path, handler, ...route.middleware as RequestHandler[]);
      }
    }
  }
  exportClientApi(app, routes);
}
export async function exportClientApi(app: Express, routes: ApiRoute<RequestHandler | WebsocketRequestHandler>[]) {
  let methods = [];
  let sourceFile = ts.createSourceFile("client.ts", "", ts.ScriptTarget.ESNext, false, ts.ScriptKind.TS);

  let factory = ts.factory;
  //@ts-expect-error
  sourceFile.statements = [
    factory.createClassDeclaration(
      [factory.createToken(ts.SyntaxKind.ExportKeyword)],
      factory.createIdentifier("Client"),
      undefined,
      undefined,
      [
        factory.createPropertyDeclaration(
          [
            factory.createToken(ts.SyntaxKind.PublicKeyword),
            factory.createToken(ts.SyntaxKind.ReadonlyKeyword)
          ],
          factory.createIdentifier("baseURL"),
          undefined,
          factory.createTypeReferenceNode(
            factory.createIdentifier("URL"),
            undefined
          ),
          undefined
        ),
        factory.createConstructorDeclaration(
          undefined,
          [factory.createParameterDeclaration(
            undefined,
            undefined,
            factory.createIdentifier("url"),
            undefined,
            factory.createUnionTypeNode([
              factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
              factory.createTypeReferenceNode(
                factory.createIdentifier("URL"),
                undefined
              )
            ]),
            undefined
          )],
          factory.createBlock(
            [factory.createExpressionStatement(factory.createBinaryExpression(
              factory.createPropertyAccessExpression(
                factory.createThis(),
                factory.createIdentifier("baseURL")
              ),
              factory.createToken(ts.SyntaxKind.EqualsToken),
              factory.createNewExpression(
                factory.createIdentifier("URL"),
                undefined,
                [factory.createIdentifier("url")]
              )
            ))],
            true
          )
        ),
        ...routes.map(p => p.createMethodDeclaration())
      ]
    )];
  const printer = ts.createPrinter();
  fs.writeFileSync('./apiClient.ts',printer.printFile(sourceFile));

}
