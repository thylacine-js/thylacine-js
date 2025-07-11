import setupEnv from "@thylacine-js/common/setupEnv.js";
import build from "@thylacine-js/webapp/build.js";

await setupEnv();
await build();
