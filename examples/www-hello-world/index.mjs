import setupEnv from '@thylacine-js/utils/setupEnv.mjs';
import serve from '@thylacine-js/webapp/serve.mjs';

await setupEnv();
await serve();