import setupEnv from "@thylacine-js/common/setupEnv.mjs";
import build from "@thylacine-js/webapp/build.mjs";

await setupEnv();
await build();
