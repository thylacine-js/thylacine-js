import parseMultipartBody from './middleware/parseMultipartBody.mjs';
import parseBody from './middleware/parseBody.mjs';
import parseUpload from './middleware/parseUpload.mjs';


import setupServer from './setupServer.mjs';

// eslint-disable-next-line @typescript-eslint/no-namespace, @typescript-eslint/prefer-namespace-keyword
declare module middleware {
    export {parseMultipartBody, parseBody, parseUpload};
}

export { setupServer, middleware};
export {Config} from './config.mjs';
