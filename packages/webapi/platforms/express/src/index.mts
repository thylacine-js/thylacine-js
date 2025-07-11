import parseMultipartBody from "./middleware/parseMultipartBody.mjs";
import parseBody from "./middleware/parseBody.mjs";
import parseUpload from "./middleware/parseUpload.mjs";

import setupServer from "./setupServer.mjs";

// eslint-disable-next-line @typescript-eslint/no-namespace, @typescript-eslint/prefer-namespace-keyword
//${export declare module middleware {    export {parseMultipartBody, parseBody, parseUpload};
//}}`

export { setupServer };
export * as config from "./config.mjs";

export { Logging } from "@thylacine-js/webapi-common";

export const parsers = { parseMultipartBody, parseBody, parseUpload };
