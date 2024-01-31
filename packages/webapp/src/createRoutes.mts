/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { isFunction } from "lodash";

function addRoutes(acc: any[], level: any, layouts: any[]) {
  for (const route of level.routes) {
    acc.push({
      path: route.path,
      element: React.createElement(route.module),
      loader: route.loader,
      action: route.action,
    });
  }
  for (const [key, value] of Object.entries(level)) {
    const layout = layouts.find((i) => i.name === key);
    if (key !== "routes") {
      const layout_acc = [];
      acc.push({
        element: React.createElement(layout.module),
        children: addRoutes(layout_acc, value, layouts),
      });
    }
  }
  return acc;
}

export default function createRoutes(routes_list): any {
  const nested_routes = { routes: [] };
  for (const route of routes_list) {
    if (route.path) {
      if (!isFunction(route.module)) {
        console.warn(`Route ${route.path} is missing a default export function`);
      }
      if (route.layout) {
        if (typeof route.layout === "string") {
          nested_routes[route.layout] ||= { routes: [] };
          nested_routes[route.layout].routes.push(route);
        } else {
          const wip = nested_routes;
          for (const l of route.layout) {
            wip[l] ||= { routes: [] };
          }
          nested_routes[route.layout].routes.push(route);
        }
      } else {
        nested_routes.routes.push(route);
      }
    }
  }
  const layouts = routes_list.filter((i) => !i.path);

  const routes = addRoutes([], nested_routes, layouts);

  return routes;
}
