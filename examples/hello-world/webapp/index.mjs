import setupEnv from "@thylacine-js/common/setupEnv.mjs";
import serve from "@thylacine-js/webapp/serve.mjs";

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const webappDir = `${__dirname}/`;

await setupEnv();
await serve(webappDir);
