import { RequestHandler, Request } from 'express';

import { Config, appendToStartIfAbsent } from './config.mjs';
import { WebsocketRequestHandler } from 'express-ws';
import { Extensible } from '@thylacine-js/common/extensible.mjs';
import ts, { ClassElement, Declaration, MethodDeclaration, Statement, readConfigFile } from 'typescript';
import camelCase from 'lodash/camelCase.js';
import { Dirent, readdirSync } from 'node:fs';
import nodePath from 'node:path';
import { FileWatcher } from 'typescript';


export const enum CanonicalMethod {

    get = 'get',
    post = 'post',
    put = 'put',
    delete = 'delete',
    patch = 'patch',
    options = 'options',
    head = 'head',
    all = 'all',
    ws = 'ws',
    trace = 'trace'
}



export type HttpMethod = Extensible<CanonicalMethod, string>;

const PathExp = new RegExp(`(.*)${Config.ROUTE_ROOT}(.*)/(.*).mjs`);


export class RouteNode {
    public readonly path: string;
    public readonly children: Map<string, RouteNode | ApiRoute<any>> = new Map();

    public readonly parent: RouteNode;

    public constructor (path: string, parent:RouteNode = null) {
        this.path = path;
        this.parent = parent;
    }

    static async create(path: string, baseDirectory: string, parent: RouteNode = null): Promise<RouteNode | ApiRoute<RequestHandler | WebsocketRequestHandler> | void> {


        let entries = readdirSync(nodePath.join(baseDirectory, path), { withFileTypes: true }) as Dirent[];
        console.log(`Path ${path} with baseDirectory ${baseDirectory} has ${entries.length} entries.`);
        if (entries.length === 1) {
            const dirent = entries[0];
            if (dirent.isFile() && entries[0].name.endsWith(".mjs")) {
                return await ApiRoute.create(nodePath.join(dirent.path, dirent.name), parent);
            }
            else if (entries[0].isDirectory()) {
                return await RouteNode.create(nodePath.join(path, dirent.name), baseDirectory, parent);
            }
        }
        else if (entries.length === 0) {   /*Don't create a node for an empty directory*/ }
        else {
            let node = new RouteNode(path,parent);

            for (const dirent of entries) {

                if (dirent.isDirectory()) {
                    let childNode = await RouteNode.create(nodePath.join(path, dirent.name), baseDirectory, node);
                    if (childNode) {
                        node.children.set(childNode.path, childNode);

                    }
                }
                else if (dirent.isFile() && dirent.name.endsWith(".mjs")) {
                    node.children.set(dirent.name, await ApiRoute.create(nodePath.join(dirent.path, dirent.name), node));
                }


            }
            return node;
        }

    }

    public createDeclaration(): ClassElement[] {
        return Array.from(this.children.values()).flatMap(p => p.createDeclaration());
    }
}



export class ApiRoute<THandler extends RequestHandler | WebsocketRequestHandler>
{
    public readonly method: HttpMethod;
    public readonly path: string;

    public readonly filePath: string;
d

    public handler: THandler;

    public readonly middleware: THandler[];

    static routeMap = new Map<string, RequestHandler | WebsocketRequestHandler>();

    public operation: string;
    parent: RouteNode;

    stringify(): string {
        return JSON.stringify({ method: this.method, path: this.path, fullPath: this.filePath, handler: this.handler.name, middleware: this.middleware.map(m => m.name) });
    }
    public static async create(path: string, parent: RouteNode): Promise<ApiRoute<RequestHandler | WebsocketRequestHandler>> {
        const m = path.match(PathExp);
        if (m) {

            let handler = null;
            let middleware = [];
            let method = m[3].toLowerCase() as HttpMethod;
            let route = appendToStartIfAbsent(m[2], "/");
            let r = null;

            if (!Config.LAZY_LOAD && !Config.HOT_RELOAD)
            {
                let module = await import(path);
                handler = module.default;
                middleware = module.middleware || [];

            }
            else {
                handler = async (res: Request, req, next) => {
                    let actHandler = this.routeMap.get(res.path) as RequestHandler;
                    if (actHandler)
                        return actHandler(res, req, next);
                    else {
                        let module = await import(path);
                        if (module.default)
                            actHandler = module.default;
                        this.routeMap[res.path] = actHandler;
                        return actHandler(res, req, next);

                    }

                };
            }
            if (Config.HOT_RELOAD) {
                let module = await import(path);

                this.routeMap[path] = module.default;
                middleware = module.middleware || [];

            }
            if (method !== CanonicalMethod.ws) {
                r = new ApiRoute<RequestHandler>(method, route, path, handler, middleware, parent);
            }
            else
                r = new ApiRoute<WebsocketRequestHandler>(method, route, path, handler, middleware, parent);



            console.log(r.stringify());
            return r;

        }
        throw new Error(`Invalid path ${path}`);
    }

    private constructor (method: HttpMethod, route: string, path: string, handler: THandler, middleware: THandler[], parent: RouteNode) {

        this.filePath = path;
        this.path = route;
        this.method = method;
        this.handler = handler;
        this.middleware = middleware;
        this.parent = parent;

    }


    public createDeclaration(): MethodDeclaration {
        let factory = ts.factory;
        return factory.createMethodDeclaration(
            [
                factory.createToken(ts.SyntaxKind.PublicKeyword),
                factory.createToken(ts.SyntaxKind.AsyncKeyword)
            ],
            undefined,
            factory.createIdentifier(this.handler.name !== "default" ? this.handler.name : camelCase(`${this.method}_${this.path}`)),
            undefined,
            undefined,
            [factory.createParameterDeclaration(
                undefined,
                factory.createToken(ts.SyntaxKind.DotDotDotToken),
                factory.createIdentifier("args"),
                undefined,
                undefined,
                undefined
            )],
            factory.createTypeReferenceNode(
                factory.createIdentifier("Promise"),
                [factory.createTypeReferenceNode(
                    factory.createIdentifier("Response"),
                    undefined
                )]
            ),
            factory.createBlock(
                [
                    factory.createVariableStatement(
                        undefined,
                        factory.createVariableDeclarationList(
                            [factory.createVariableDeclaration(
                                factory.createIdentifier("r"),
                                undefined,
                                undefined,
                                factory.createAwaitExpression(factory.createCallExpression(
                                    factory.createIdentifier("fetch"),
                                    undefined,
                                    [
                                        factory.createNewExpression(
                                            factory.createIdentifier("URL"),
                                            undefined,
                                            [
                                                factory.createStringLiteral(this.path),
                                                factory.createPropertyAccessExpression(
                                                    factory.createThis(),
                                                    factory.createIdentifier("baseURL")
                                                )
                                            ]
                                        ),
                                        factory.createObjectLiteralExpression(
                                            [factory.createPropertyAssignment(
                                                factory.createIdentifier("method"),
                                                factory.createStringLiteral(this.method.toUpperCase())
                                            )],
                                            false
                                        )
                                    ]
                                ))
                            )],
                            ts.NodeFlags.Let | ts.NodeFlags.AwaitContext | ts.NodeFlags.ContextFlags | ts.NodeFlags.TypeExcludesFlags
                        )
                    ),
                    factory.createReturnStatement(factory.createIdentifier("r"))
                ],
                true
            )
        );


    }


}
