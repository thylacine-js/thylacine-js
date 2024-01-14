import http from "http";
import https from "https";
import fs from "fs";

export default function createProxyServer({
  host,
  port,
  ssl,
  defaultPath = "/",
}) {
  const proto = ssl ? https : http;
  const ssl_options = ssl
    ? {
        key: fs.readFileSync(ssl.keyfile),
        cert: fs.readFileSync(ssl.certfile),
      }
    : {};
  const server = proto.createServer({ ...ssl_options }, async (req, res) => {
    const options = {
      hostname: host,
      port: port,
      path: req.url,
      method: req.method,
      headers: req.headers,
    };
    const proxyReq = http.request(options, (proxyRes) => {
      if (proxyRes.statusCode === 404) {
        const proxyReq2 = http.request(
          { ...options, path: defaultPath },
          (proxyRes2) => {
            res.writeHead(proxyRes2.statusCode, proxyRes2.headers);
            proxyRes2.pipe(res, { end: true });
          }
        );
        req.pipe(proxyReq2, { end: true });
      } else {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
      }
    });
    req.pipe(proxyReq, { end: true });
  });
  return server;
}
