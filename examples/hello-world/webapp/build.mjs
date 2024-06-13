import setupEnv from "@thylacine-js/common/setupEnv.mjs";
import build from "@thylacine-js/webapp/build.mjs";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webappDir = `${__dirname}/`;

await setupEnv();
await build(webappDir);
