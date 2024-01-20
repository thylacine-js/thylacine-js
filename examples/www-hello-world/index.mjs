import setupEnv from '@thylacine-js/common/setupEnv.mjs';
import serve from '@thylacine-js/webapp/serve.mjs';

await setupEnv();
await serve();