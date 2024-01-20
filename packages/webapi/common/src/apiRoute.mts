import { RequestHandler } from 'express';

import { Config } from './config.mjs';
import { WebsocketRequestHandler } from 'express-ws';
import { Extensible } from '@thylacine-js/common/extensible.mjs';

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

const PathExp = new RegExp(`./${Config.ROUTE_ROOT}(.*)/(.*).mjs`);
export class ApiRoute<THandler extends RequestHandler | WebsocketRequestHandler>
{
    public readonly method: HttpMethod;
    public readonly path : string;

    public readonly fullPath : string;

    public readonly handler : THandler;

    public readonly middleware : THandler[];

    public static async create(path : string) : Promise<ApiRoute<RequestHandler | WebsocketRequestHandler>>
    {
        const m = path.match(PathExp);
        if (m) {
            let module = (await import(path));
            let handler = module.default;
            let middleware = module.middleware || [];
            let method = m[2].toLowerCase() as HttpMethod;
            let route = m[1];
            if(method === CanonicalMethod.ws)
                return new ApiRoute<WebsocketRequestHandler>(method,route,path,handler,middleware);
            else
                return new ApiRoute<RequestHandler>(method,route,path,handler,middleware);
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



}