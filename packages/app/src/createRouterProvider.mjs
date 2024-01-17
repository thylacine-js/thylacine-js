import React from 'react';
import { RouterProvider  } from "react-router-dom";
import createRouter from "./createRouter.mjs";

export default async function createRouteProvider(routes_list) {
  const router = await createRouter(routes_list);
  return React.createElement(RouterProvider, {router});
}