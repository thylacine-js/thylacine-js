import React from 'react';
import { createBrowserRouter, Outlet, ScrollRestoration } from "react-router-dom";

import useHMR from './useHMR.mjs';


function App(){
  useHMR();
  return React.createElement(
    'div',
    { className: 'App' },
    React.createElement(Outlet, null),
    React.createElement(ScrollRestoration, null)
  );
};

function addRoutes(acc, level, layouts) {
  for (const route of level.routes) {
    acc.push({
      path: route.path,
      element: React.createElement(route.module),
      loader: route.loader,
      action: route.action,
    });
  }
  for (const [key, value] of Object.entries(level)) {
    const layout = layouts.find(i => i.name === key);
    if (key !== 'routes') {
      const layout_acc = [];
      acc.push({
        element: React.createElement(layout.module),
        children: addRoutes(layout_acc, value, layouts)
      });
    }
  }
  return acc;
}


export default function createRouter(routes_list) : any {
  let nested_routes = {routes: []};
  for (const route of routes_list) {
    if (route.path) {
      if (route.layout) {
        if (typeof route.layout === 'string') {
          nested_routes[route.layout] ||= {routes: []};
          nested_routes[route.layout].routes.push(route);
        } else {
          let wip = nested_routes;
          for (const l of route.layout) {
            wip[l] ||= {routes: []};
          }
          nested_routes[route.layout].routes.push(route);
        }
      } else {
        nested_routes.routes.push(route);
      }
    }
  }
  const layouts = routes_list.filter(i => !i.path);

  const routes = addRoutes([], nested_routes, layouts);

  return createBrowserRouter([{
    element: React.createElement(App),
    children: routes
  }]);

}