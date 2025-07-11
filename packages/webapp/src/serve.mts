import esbuild from "esbuild";
import createConfig from "./lib/createConfig.mjs";
import createProxyServer from "./lib/createProxyServer.mjs";
import path from "path";
import { promisify } from "util";

export default async function (webappDir = process.cwd()) {
  const BUILD_DIR = process.env.APP_ENV === "production" ? "dist/production" : "dist/development";

  const config = createConfig({ appDir: webappDir });
  const ctx = await esbuild.context({ ...config });
  if (process.env.APP_ENV !== "production") {
    await ctx.watch();
    globalThis.WATCH_ENABLED = true;
  }

  const servedir = path.resolve(path.join(webappDir, BUILD_DIR));

  const { host, port } = await ctx.serve({
    servedir,
    onRequest: (e) => {
      console.log(`${e.status} ${e.method} ${e.path}`);
    },
  });

  const APP_HOST = process.env.APP_HOST || "0.0.0.0";
  const APP_PORT = process.env.APP_PORT ? parseInt(process.env.APP_PORT) : 6800;
  const ssl = null;

  const server = createProxyServer({ host, port, ssl, defaultPath: "/" });
  await promisify(server.listen.bind(server))(APP_PORT);
  console.log(`serving at ${process.env.APP_PROTOCOL || "http"}://${APP_HOST}${APP_PORT === 80 ? "" : `:${APP_PORT}`}`);
}
