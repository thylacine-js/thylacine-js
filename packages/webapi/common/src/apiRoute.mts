import { RequestHandler } from 'express';

import { Config, appendToStartIfAbsent } from './config.mjs';
import { WebsocketRequestHandler } from 'express-ws';
import { Extensible } from '@thylacine-js/common/extensible.mjs';
import ts, { MethodDeclaration } from 'typescript';
import camelCase from 'lodash/camelCase.js';

export const enum CanonicalMethod {

    get = 'get',
    post = 'post',
    put = 'put',
    delete = 'delete',
    patch = 'patch',
    all = 'all',
    ws = 'ws'
}

export type HttpMethod = Extensible<CanonicalMethod, string>;

const PathExp = new RegExp(`(.*)${Config.ROUTE_ROOT}(.*)/(.*).mjs`);
export class ApiRoute<THandler extends RequestHandler | WebsocketRequestHandler>
{
    public readonly method: HttpMethod;
    public readonly path : string;

    public readonly fullPath : string;

    public readonly handler : THandler;

    public readonly middleware : THandler[];

     stringify() : string
    {
        return JSON.stringify({method:this.method,path:this.path,fullPath:this.fullPath,handler:this.handler.name,middleware:this.middleware.map(m=>m.name)});
    }
    public static async create(path : string) : Promise<ApiRoute<RequestHandler | WebsocketRequestHandler>>
    {
        const m = path.match(PathExp);
        if (m) {
            let module = (await import(path));
            let handler = module.default;
            let middleware = module.middleware || [];
            let method = m[3].toLowerCase() as HttpMethod;
            let route = appendToStartIfAbsent(m[2],"/");
            let r = null;
            if(method === CanonicalMethod.ws)
                r = new ApiRoute<WebsocketRequestHandler>(method,route,path,handler,middleware);
            else
                r = new ApiRoute<RequestHandler>(method,route,path,handler,middleware);

            console.log(r.stringify());
            return r;

        }
        throw new Error(`Invalid path ${path}`);
    }

    private constructor(method: HttpMethod, route: string, path : string, handler : THandler, middleware : THandler[])
    {

            this.fullPath = path;
            this.path = route;
            this.method = method;
            this.handler = handler;
            this.middleware = middleware;

    }


    public createMethodDeclaration() : MethodDeclaration
    {
        let factory = ts.factory;
        return factory.createMethodDeclaration(
            [
                factory.createToken(ts.SyntaxKind.PublicKeyword),
                factory.createToken(ts.SyntaxKind.AsyncKeyword)
            ],
            undefined,
            factory.createIdentifier(camelCase(`${this.method}_${this.path}`)),
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
        )


    }


}
