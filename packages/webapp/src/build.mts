import esbuild from "esbuild";
import createConfig from "./lib/createConfig.mjs";

export default async function (webappDir = process.cwd()) {
  const config = createConfig({ appDir: webappDir });
  await esbuild.build({ ...config });
}
