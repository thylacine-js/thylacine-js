import type { RequestHandler } from "express";
import { WebsocketRequestHandler } from "express-ws";
import { globby } from "globby";
import { Config } from "./config.mjs";

import { HTTP_VERBS } from "./setupRouter.mjs";
import { Dirent, readdirSync } from "fs";
import { entries } from "lodash";

interface IRoute {
  path: string;
  readonly children: Map<string, IRoute>;
}
