import * as React from "react";
import * as ReactDOM from "react-dom/client";

import createRouterProvider from "@thylacine-js/webapp/createRouterProvider.mjs";

async function main() {
  const routerProvider = await createRouterProvider(ROUTES_LIST);

  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      {routerProvider}
    </React.StrictMode>
  );
}

main();