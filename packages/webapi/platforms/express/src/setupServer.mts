import cookie_parser from "cookie-parser";
import cookie_session from "cookie-session";
import cors from "cors";
import express, { Application, Express, RequestHandler, Request, Response, NextFunction } from "express";

import setupRouter from "@thylacine-js/webapi-common/setupRouter.mjs";

export default async function setupServer({ appDir = process.cwd(), validateCors = null } = {}) {
  const app: Express & { ws?: any } = express();

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
        if (origin === APP_ORIGIN) {
          cb(null, true);
          return APP_ORIGIN;
        } else if (origin === API_ORIGIN) {
          cb(null, true);
          return API_ORIGIN;
        } else if (validateCors) {
          cb(null, validateCors(origin));
          return false;
        } else {
          cb(null, false);
          return false;
        }
      },
    })
  );

  if (!process.env.COOKIE_SECRET) {
    console.warn("WARN: COOKIE_SECRET not defined! Your cookies are insecure.");
  }
  const COOKIE_SECRET = process.env.COOKIE_SECRET || "WARNING_YOU_MUST_SET_THIS";
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
      maxAge: null as any,
    })
  );
  //expressWs(app);
  const tree = await setupRouter(app, { appDir });
  app.use((err: { message: any }, req: Request, res: Response, next: NextFunction) => {
    res.json({
      ok: false,
      error: err?.message,
    });
  });
  return app;
}
