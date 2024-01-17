import express, {Express} from "express";
import expressWs, { Application } from "express-ws";
import cookie_parser from "cookie-parser";
import cookie_session from "cookie-session";
import cors from "cors";

import setupRouter from "./setupRouter.mjs";

export default async function setupServer({ appDir = process.cwd() } = {}) {
  const app : Express & {ws?: any} = express();
  app.use((req, res, next) => {
    // TODO better default logging
    console.log(`${req.method} ${req.path}`);
    next();
  });
  app.use(
    cors({
      credentials: true,
      origin: function (origin, cb) {
        const APP_ORIGIN = process.env.APP_ORIGIN;
        const API_ORIGIN = process.env.API_ORIGIN;

        if (!origin) {
          cb(null, false);
          return false;
        }
        if (APP_ORIGIN) {
          cb(null, true);
          return APP_ORIGIN;
        } else if (API_ORIGIN) {
          cb(null, true);
          return API_ORIGIN;
        }
      },
    })
  );

  if (!process.env.COOKIE_SECRET) {
    console.warn("WARN: COOKIE_SECRET not defined! Your cookies are insecure.");
  }
  const COOKIE_SECRET =
    process.env.COOKIE_SECRET || "WARNING_YOU_MUST_SET_THIS";
  app.use(cookie_parser(COOKIE_SECRET));
  app.use(
    cookie_session({
      name: "session",
      secret: COOKIE_SECRET,
      signed: !process.env.APP_TEST,
      domain: process.env.COOKIE_DOMAIN,
      path: "/",
      // httpOnly: false,
      // secure: false,
      maxAge: null as any
    })
  );
  //expressWs(app);
  await setupRouter(app, {appDir});
  app.use((err: { message: any; }, req: any, res: { json: (arg0: { ok: boolean; error: any; }) => void; }, next: any) => {
    res.json({
      ok: false,
      error: err?.message,
    });
  });
  return app;
}
