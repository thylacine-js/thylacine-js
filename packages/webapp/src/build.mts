import esbuild from "esbuild";
import createConfig from "./lib/createConfig.mjs";

export default async function () {
  const config = createConfig();
  await esbuild.build({ ...config });
}
