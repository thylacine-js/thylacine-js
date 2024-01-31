/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { createBrowserRouter, Outlet, ScrollRestoration } from "react-router-dom";

import useHMR from "./useHMR.mjs";
import createRoutes from "./createRoutes.mjs";

function App() {
  useHMR();
  return React.createElement(
    "div",
    { className: "App" },
    React.createElement(Outlet, null),
    React.createElement(ScrollRestoration, null)
  );
}

export default function createRouter(routes_list): any {
  const routes = createRoutes(routes_list);

  return createBrowserRouter([
    {
      element: React.createElement(App),
      children: routes,
    },
  ]);
}
