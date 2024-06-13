import { setupServer, Config, Logging } from "@thylacine-js/webapi-express";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const appDir = `${__dirname}/`;

Config.init();
Logging.Logger.init();
const server = await setupServer({ appDir });
server.listen(Config.API_PORT, () => {
  console.log(`listening on ${Config.API_ORIGIN}`);
});
