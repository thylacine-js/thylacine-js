import { Handler, RequestHandler } from "express";
import {
  Request,
  ParamsDictionary,
  Response,
  NextFunction,
} from "express-serve-static-core";
import { ParsedQs } from "qs";
import { isAsyncFunction, isPromise } from "util/types";

const catchAsyncErrors = (fn: RequestHandler) => {
  if (isAsyncFunction(fn))
    return async (
      req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
      res: Response<any, Record<string, any>, number>,
      next: NextFunction
    ) => {
      const r = fn(req, res, next);
      if (isPromise(r)) {
        r.catch(next);
      } else {
        return r;
      }
    };
  else {
    return fn;
  }
};

export default catchAsyncErrors;
