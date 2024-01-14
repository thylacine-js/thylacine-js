import fs from "fs-extra";
import { globbySync } from "globby";
import chokidar from "chokidar";

import esbuildOnStartBuild from "./esbuildOnStartBuild.mjs";
import esbuildOnEndBuild from "./esbuildOnEndBuild.mjs";
import findRouteFiles from "./findRouteFiles.mjs";
import findLayoutFiles from "./findLayoutFiles.mjs";
import createRoutesInjection from "./createRoutesInjection.mjs";

export default function createConfig({ appDir = process.cwd() } = {}) {
  const allowedEnvVars = [
    "NODE_ENV",
    "WWW_ORIGIN",
    "API_ORIGIN",
    "COOKIE_DOMAIN",
  ];

  const clientEnv = { "process.env.TIMESTAMP": Date.now().toString() };

  for (const key in process.env) {
    if (key.indexOf("CLIENT_") === 0 || allowedEnvVars.includes(key)) {
      clientEnv[`process.env.${key}`] = `'${process.env[key]}'`;
    }
  }

  fs.ensureFileSync(`${appDir}/.temp/inject/ROUTES_LIST.mjs`);

  const BUILD_DIR =
    process.env.NODE_ENV === "production"
      ? "dist/production"
      : "dist/development";

  return {
    entryPoints: ["app.jsx"],
    bundle: true,
    minify: true,
    sourcemap: "inline",
    outdir: BUILD_DIR,
    define: clientEnv,
    inject: ["./.temp/inject/ROUTES_LIST.mjs"],
    logLevel: "error",
    plugins: [
      esbuildOnStartBuild({
        name: "findRouteFiles",
        handler: async () => {
          const layouts = await findLayoutFiles();
          const routes = await findRouteFiles();
          const injection = createRoutesInjection(routes, layouts, appDir);
          fs.writeFileSync(`./.temp/inject/ROUTES_LIST.mjs`, injection, "utf-8");
        },
      }),
      esbuildOnEndBuild({
        name: "rewriteProcessEnv",
        handler: async (build) => {
          function handleFile(fp) {
            const m = fp.match(`./static/(.*)`);
            const wp = m[1];
            const dir_match = wp.match("(.*)/(.*)");
            if (dir_match) {
              fs.ensureDirSync(`${BUILD_DIR}/${dir_match[1]}`);
            }
            const env_match = wp.match(`(.*)\.env\.(.*)`);
            if (env_match) {
              let c = fs.readFileSync(fp, "utf-8");
              for (const kv of Object.entries({
                ...clientEnv,
                "process.env.TIMESTAMP": Date.now().toString(),
              })) {
                c = c.replaceAll(
                  `{{${kv[0]}}}`,
                  kv[1].replace(/^'(.*)'$/, "$1")
                );
                c = c.replaceAll(kv[0], kv[1]);
              }
              fs.writeFileSync(
                `${BUILD_DIR}/${env_match[1]}\.${env_match[2]}`,
                c,
                "utf-8"
              );
            } else {
              fs.copyFileSync(fp, `${BUILD_DIR}/${wp}`);
            }
          }
          fs.ensureDirSync(BUILD_DIR);
          const fps = globbySync(`./static/**`);
          for (const fp of fps) {
            handleFile(fp);
          }
          if (globalThis.WATCH_ENABLED) {
            const watcher = chokidar.watch(`./static`, {
              disableGlobbing: false,
              usePolling: true,
              interval: 500,
            });
            watcher.on("change", (fp) => {
              handleFile(`./${fp}`);
            });
          }
        },
      }),
    ],
  };
}
