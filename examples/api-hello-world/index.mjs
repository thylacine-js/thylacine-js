import setupEnv from '@thylacine-js/utils/setupEnv.mjs';
import setupServer from '@thylacine-js/webapi/setupServer.mjs';

setupEnv();
const server = await setupServer();
server.listen(process.env.API_PORT, () => {
  console.log(`listening on ${process.env.API_ORIGIN}`);
});