/* eslint-disable @typescript-eslint/no-unused-vars */
import { RequestHandler, Request } from "express";

import { Config, appendToStartIfAbsent, trimStart } from "./config.mjs";
import { WebsocketRequestHandler } from "express-ws";
import { Extensible } from "@thylacine-js/common/extensible.mjs";
import ts, {
  CallExpression,
  ClassElement,
  Declaration,
  FunctionDeclaration,
  MethodDeclaration,
  ParameterDeclaration,
  Statement,
  readConfigFile,
  createLanguageService,
} from "typescript";
import camelCase from "lodash/camelCase.js";
import { Dirent, readdirSync } from "node:fs";
import nodePath from "node:path";

import _, { create } from "lodash";

export const enum CanonicalMethod {
  get = "get",
  post = "post",
  put = "put",
  delete = "delete",
  patch = "patch",
  options = "options",
  head = "head",
  all = "all",
  ws = "ws",
  trace = "trace",
}

export type HttpMethod = Extensible<CanonicalMethod, string>;

const PathExp = new RegExp(`(.*)${Config.ROUTE_ROOT}(.*)/(.*).mjs`);

const ParamsExp = /\[(\w+)\]/g;

export class RouteNode {
  public readonly path: string;

  public readonly subPath: string;
  public readonly children: Map<string, RouteNode | ApiRoute<any>> = new Map();

  public readonly parent: RouteNode;

  public params: { [x: string]: string };

  public constructor(path: string, parent: RouteNode = null) {
    this.path = path;
    this.subPath = trimStart(path.replace(parent?.path ?? "", ""), "/");
    this.parent = parent;
    let s;
    this.params = { ...parent?.params };
    while ((s = ParamsExp.exec(this.subPath)) !== null) {
      console.log(`Found param ${s[1]} in ${this.subPath}`);
      this.params[s[1]] = "string";
    }
  }

  static async create(
    path: string,
    baseDirectory: string,
    parent: RouteNode = null
  ): Promise<RouteNode | ApiRoute<RequestHandler | WebsocketRequestHandler> | void> {
    const entries = readdirSync(nodePath.join(baseDirectory, path), {
      withFileTypes: true,
    }) as Dirent[];
    console.log(`Path ${path} with baseDirectory ${baseDirectory} has ${entries.length} entries.`);
    if (entries.length === 1) {
      const dirent = entries[0];
      if (dirent.isFile() && entries[0].name.endsWith(".mjs")) {
        return await ApiRoute.create(nodePath.join(dirent.path, dirent.name), parent);
      } else if (entries[0].isDirectory()) {
        return await RouteNode.create(nodePath.join(path, dirent.name), baseDirectory, parent);
      }
    } else if (entries.length === 0) {
      /*Don't create a node for an empty directory*/
    } else {
      const node = new RouteNode(path, parent);

      for (const dirent of entries) {
        if (dirent.isDirectory()) {
          const childNode = await RouteNode.create(nodePath.join(path, dirent.name), baseDirectory, node);
          if (childNode) {
            node.children.set(childNode.path, childNode);
          }
        } else if (dirent.isFile() && dirent.name.endsWith(".mjs")) {
          node.children.set(dirent.name, await ApiRoute.create(nodePath.join(dirent.path, dirent.name), node));
        }
      }
      return node;
    }
  }

  public createDeclaration(): ClassElement[] {
    return Array.from(this.children.values()).flatMap((p) => p.createDeclaration());
  }
}

export class ApiRoute<THandler extends RequestHandler | WebsocketRequestHandler> {
  public readonly method: HttpMethod;
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
      const method = m[3].toLowerCase() as HttpMethod;
      const route = appendToStartIfAbsent(m[2], "/");
      let r = null;

      if (!Config.LAZY_LOAD && !Config.HOT_RELOAD) {
        const module = await import(path);
        handler = module.default;
        middleware = module.middleware || [];
      } else {
        handler = async (res: Request, req, next) => {
          let actHandler = this.routeMap.get(res.path) as RequestHandler;
          if (actHandler) return actHandler(res, req, next);
          else {
            const module = await import(path);
            if (module.default) actHandler = module.default;
            this.routeMap[res.path] = actHandler;
            return actHandler(res, req, next);
          }
        };
      }
      if (Config.HOT_RELOAD) {
        const module = await import(path);

        this.routeMap[path] = module.default;
        middleware = module.middleware || [];
      }
      if (method !== CanonicalMethod.ws) {
        r = new ApiRoute<RequestHandler>(method, route, path, handler, middleware, parent);
      } else r = new ApiRoute<WebsocketRequestHandler>(method, route, path, handler, middleware, parent);

      console.log(r.stringify());
      return r;
    }
    throw new Error(`Invalid path ${path}`);
  }

  static visitChildren(child: ts.Node, cb: (p: ts.Node) => void) {
    const t = child;
    if (t !== undefined) {
      cb(t);
      child.forEachChild((p) => this.visitChildren(p, cb));
    }
  }



  private constructor(
    method: HttpMethod,
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
    const prog = ts.createProgram([this.filePath], { allowJs: true });
    const src = prog.getSourceFile(this.filePath);
    const tc = prog.getTypeChecker();

    ApiRoute.visitChildren(src, (p) => {
      if (ts.isFunctionDeclaration(p)) {
        //console.log((p, src, prog));

        console.log(prog.getTypeChecker().signatureToString(prog.getTypeChecker().getSignatureFromDeclaration(p)));
        p.parameters.forEach((q) => {
          const qs = tc.getSymbolAtLocation(q);

          console.log(
            `${q.name.getFullText()}: type is ${prog.getTypeChecker().typeToString(prog.getTypeChecker().getTypeAtLocation(q))}`
          );
          ApiRoute.visitChildren(p.body, (r) => {
            if (ts.isPropertyAccessExpression(r)) {
              if (tc.getSymbolAtLocation(r.expression).valueDeclaration === q) {
                console.log(r.getText());
              }

            }
          });
        });
      }
    });

    this.params = { ...parent?.params };
    while ((s = ParamsExp.exec(this.subPath)) !== null) {
      console.log(`Found param ${s[1]} in ${this.subPath}`);
      this.params[s[1]] = "string";
    }
  }

  createParameterDeclaration(): ParameterDeclaration[] {
    const factory = ts.factory;

    if (Object.keys(this.params).length > 0) {
      const params = [];
      for (const key in this.params) {
        params.push(
          factory.createParameterDeclaration(
            undefined,
            undefined,
            factory.createIdentifier(key),
            undefined,
            factory.createTypeReferenceNode(this.params[key]),
            undefined
          )
        );
      }
      return params;
    } else
      return [
        factory.createParameterDeclaration(
          undefined,
          factory.createToken(ts.SyntaxKind.DotDotDotToken),
          factory.createIdentifier("params"),
          undefined,
          undefined,
          undefined
        ),
      ];
  }

  public createDeclaration(): MethodDeclaration {
    const factory = ts.factory;
    return factory.createMethodDeclaration(
      [factory.createToken(ts.SyntaxKind.PublicKeyword), factory.createToken(ts.SyntaxKind.AsyncKeyword)],
      undefined,
      factory.createIdentifier(this.operation),
      undefined,
      undefined,
      this.createParameterDeclaration(),
      factory.createTypeReferenceNode(factory.createIdentifier("Promise"), [
        factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
      ]),
      factory.createBlock(
        [
          factory.createReturnStatement(
            factory.createCallExpression(
              factory.createPropertyAccessExpression(factory.createSuper(), factory.createIdentifier(this.method)),
              undefined,
              Object.keys(this.params).length > 0
                ? [factory.createNoSubstitutionTemplateLiteral(this.interpolatedPath, this.interpolatedPath)]
                : [factory.createStringLiteral(this.path), factory.createIdentifier("params")]
            )
          ),
        ],
        true
      )
    );
  }
}
