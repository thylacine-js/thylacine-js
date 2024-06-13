//import  from "@thylacine-js/common/setupEnv.mjs";
import { setupServer, Config, Logging } from "@thylacine-js/webapi-express";

Config.init();
Logging.Logger.init();
const server = await setupServer();
server.listen(Config.API_PORT, () => {
  console.log(`listening on ${Config.API_ORIGIN}`);
});
