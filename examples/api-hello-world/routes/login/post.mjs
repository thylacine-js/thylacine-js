import { parsers } from "@thylacine-js/webapi-express";

export const middleware = [parsers.parseMultipartBody];

export default async function loginWithPassword(req, res) {
  const { username, password } = req.body || {};
  if (username === "demo" && password === "d3m0") {
    const user = { id: 1, username: "demo" };
    req.session = { user };
    res.json({ ok: true, user });
  } else {
    res.json({ ok: false, error: "login failed" });
  }
}
