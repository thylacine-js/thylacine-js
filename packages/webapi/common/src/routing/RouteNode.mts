import { RequestHandler } from "express";
import { WebsocketRequestHandler } from "express-ws";
import { Dirent, readdirSync } from "node:fs";
import nodePath from "node:path";
import { trimStart } from "../config.mjs";
import { ApiRoute, ParamsExp } from "./ApiRoute.mjs";

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
      // console.log(`Found param ${s[1]} in ${this.subPath}`);
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
    // console.log(`Path ${path} with baseDirectory ${baseDirectory} has ${entries.length} entries.`);
    if (entries.length === 1) {
      const dirent = entries[0];
      if (dirent.isFile() && entries[0].name.endsWith(".mjs")) {
        return await ApiRoute.create(nodePath.join(dirent.parentPath, dirent.name), parent);
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
          node.children.set(dirent.name, await ApiRoute.create(nodePath.join(dirent.parentPath, dirent.name), node));
        }
      }
      return node;
    }
  }
}
