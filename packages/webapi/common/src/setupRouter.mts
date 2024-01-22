import catchAsyncErrors from "./catchAsyncErrors.mjs";
import fs from 'fs';
import type { Express, IRouter, RequestHandler, Request as Req, Response as Resp, NextFunction } from 'express';
import expressWs, { Application, WebsocketRequestHandler, WithWebsocketMethod } from 'express-ws';
import { METHODS } from 'http';
import { WeakExtensible } from '@thylacine-js/common/extensible.mjs';
import { ApiRoute, CanonicalMethod, HttpMethod, RouteNode } from './apiRoute.mjs';

import ts from 'typescript';

import nodePath from 'path';


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

export async function addHandlersFrom(app: Express & { ws?: expressWs.WebsocketMethod<any>; }, node: RouteNode) {

  if(node)
  {
  for (const route of node.children.values()) {
    {
      if (route instanceof RouteNode) {
        await addHandlersFrom(app, route);
      }
      else if (route instanceof ApiRoute) {

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
  }

  }
}


export const HTTP_VERBS = METHODS.concat("ws");

export default async function setupRouter(app: Express & { ws?: expressWs.WebsocketMethod<any>; }, { appDir = process.cwd() } = {}) {
  const tree = await RouteNode.create("/", nodePath.join(appDir, "routes")) as RouteNode;
  await addHandlersFrom(app, tree);

  await exportClientApi(app, tree);
}
export async function exportClientApi(app: Express, tree: RouteNode) {
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
        ...tree.createDeclaration()
      ]
    )];
  const printer = ts.createPrinter();
  fs.writeFileSync('./apiClient.ts', printer.printFile(sourceFile));

}
