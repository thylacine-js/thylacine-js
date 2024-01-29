import esbuild from "esbuild";
import createConfig from "./lib/createConfig.mjs";
import createProxyServer from "./lib/createProxyServer.mjs";

const BUILD_DIR = process.env.APP_ENV === "production" ? "dist/production" : "dist/development";

export default async function () {
  const config = createConfig();
  const ctx = await esbuild.context({ ...config });
  if (process.env.APP_ENV !== "production") {
    await ctx.watch();
    globalThis.WATCH_ENABLED = true;
  }

  const { host, port } = await ctx.serve({
    servedir: BUILD_DIR,
    onRequest: (e) => {
      console.log(`${e.status} ${e.method} ${e.path}`);
    },
  });

  const APP_HOST = process.env.APP_HOST || "0.0.0.0";
  const APP_PORT = process.env.APP_PORT ? parseInt(process.env.APP_PORT) : 6800;
  const ssl = null;

  const server = createProxyServer({ host, port, ssl, defaultPath: "/" });
  await server.listen(APP_PORT);
  console.log(`serving at ${process.env.APP_PROTOCOL}://${APP_HOST}${APP_PORT === 80 ? "" : `:${APP_PORT}`}`);
}
