import { isAsyncFunction } from 'util/types';


const catchAsyncErrors =
  (fn:  any) =>
  (...args : any[]) => {
    const r = typeof fn === 'function' ? fn(fn): null;
    if (isAsyncFunction(r)) {
      r.catch(args[2]);
    } else {
      return r;
    }
  };

export default catchAsyncErrors;