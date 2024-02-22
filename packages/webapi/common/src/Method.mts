export enum StandardVerbs {
  get = "get",
  post = "post",
  put = "put",
  delete = "delete",
  patch = "patch",
  options = "options",
  head = "head",
  all = "all",
  ws = "ws",
  trace = "trace",
  before = "before",
  // TODO
  // after = "after",
}

export type Method<p> = StandardVerbs | p extends string ? p : "get";
