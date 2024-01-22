import type { RequestHandler } from 'express';
import { WebsocketRequestHandler } from 'express-ws';
import { globby } from 'globby';
import { Config } from './config.mjs';
import { ApiRoute } from './apiRoute.mjs';
import { HTTP_VERBS } from './setupRouter.mjs';
import { Dirent, readdirSync } from 'fs';
import { entries } from 'lodash';



class RouteNode
{
  public  path: string;
  public readonly children: Map<string, RouteNode | ApiRoute<any>> = new Map();


}
