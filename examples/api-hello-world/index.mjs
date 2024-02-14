//import  from "@thylacine-js/common/setupEnv.mjs";
import { setupServer, Config } from "@thylacine-js/webapi-express";

Config.init();
const server = await setupServer();
server.listen(Config.API_PORT, () => {
  console.log(`listening on ${Config.API_ORIGIN}`);
});
