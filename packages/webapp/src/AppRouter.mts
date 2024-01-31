import React from "react";
import { createBrowserRouter, RouterProvider, Outlet, ScrollRestoration } from "react-router-dom";

import useHMR from "./useHMR.mjs";

export function AppRouterContainer({}) {
  useHMR();

  return React.createElement(
    "div",
    { className: "AppRouterContainer" },
    React.createElement(Outlet, null),
    React.createElement(ScrollRestoration, null)
  );
}

export function AppRouter({ routes }) {
  const router = createBrowserRouter([
    {
      element: React.createElement(AppRouterContainer),
      children: routes,
    },
  ]);
  return React.createElement(RouterProvider, { router });
}

export default AppRouter;
