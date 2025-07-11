import chokidar from "chokidar";
import fs from "fs-extra";
import { globbySync } from "globby";

import { BuildOptions } from "esbuild";
import path from "path";
import createRoutesInjection from "./createRoutesInjection.mjs";
import esbuildOnEndBuild from "./esbuildOnEndBuild.mjs";
import esbuildOnStartBuild from "./esbuildOnStartBuild.mjs";
import findLayoutFiles from "./findLayoutFiles.mjs";
import findRouteFiles from "./findRouteFiles.mjs";

export default function createConfig({ appDir = process.cwd() } = {}): BuildOptions {
  const allowedEnvVars = ["NODE_ENV", "WWW_ORIGIN", "API_ORIGIN", "COOKIE_DOMAIN"];

  const clientEnv = { "process.env.TIMESTAMP": Date.now().toString() };

  for (const key in process.env) {
    if (key.indexOf("CLIENT_") === 0 || allowedEnvVars.includes(key)) {
      clientEnv[`process.env.${key}`] = `'${process.env[key]}'`;
    }
  }

  const BUILD_DIR = process.env.NODE_ENV === "production" ? `${appDir}/dist/production` : `${appDir}/dist/development`;
  const ROUTES_LIST_FILEPATH = `${BUILD_DIR}/../${process.env.NODE_ENV || "development"}-inject/ROUTES_LIST.mjs`;
  fs.ensureFileSync(ROUTES_LIST_FILEPATH);

  const appJsxEntryPoint = path.resolve(path.join(appDir, "app.jsx"));

  return {
    entryPoints: [appJsxEntryPoint],
    bundle: true,
    minify: process.env.NODE_ENV === "production",
    sourcemap: "inline",
    outdir: BUILD_DIR,
    define: clientEnv,
    inject: [ROUTES_LIST_FILEPATH],
    logLevel: "error",
    plugins: [
      esbuildOnStartBuild({
        name: "findRouteFiles",
        handler: async () => {
          const layouts = await findLayoutFiles({ appDir });
          const routes = await findRouteFiles({ appDir });
          const injection = createRoutesInjection(routes, layouts, appDir);
          fs.writeFileSync(ROUTES_LIST_FILEPATH, injection, "utf-8");
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
                c = c.replaceAll(`{{${kv[0]}}}`, kv[1].replace(/^'(.*)'$/, "$1"));
                c = c.replaceAll(kv[0], kv[1]);
              }
              fs.writeFileSync(`${BUILD_DIR}/${env_match[1]}\.${env_match[2]}`, c, "utf-8");
            } else {
              fs.copyFileSync(fp, `${BUILD_DIR}/${wp}`);
            }
          }
          fs.ensureDirSync(BUILD_DIR);
          const fps = globbySync(`${appDir}/static/**`);
          for (const fp of fps) {
            handleFile(fp);
          }
          if (globalThis.WATCH_ENABLED) {
            const watcher = chokidar.watch(`${appDir}/static`, {
              //disableGlobbing: false,
              usePolling: true,
              interval: 500,
            });
            watcher.on("change", (fp) => {
              handleFile(fp);
            });
          }
        },
      }),
    ],
  };
}
