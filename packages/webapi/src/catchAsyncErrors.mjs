import isFunction from "lodash/isFunction.js";

const catchAsyncErrors =
  (fn) =>
  (...args) => {
    const r = isFunction(fn) ? fn(...args) : null;
    if (r && r.catch) {
      r.catch(args[2]);
    } else {
      return r;
    }
  };

export default catchAsyncErrors;
