import setupEnv from "@thylacine-js/common/setupEnv.mjs";
import setupServer from "@thylacine-js/webapi-express/setupServer.mjs";

setupEnv();
const server = await setupServer();
server.listen(process.env.API_PORT, () => {
  console.log(`listening on ${process.env.API_ORIGIN}`);
});
