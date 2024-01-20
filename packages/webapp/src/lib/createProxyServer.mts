import http, { IncomingMessage } from 'http';
import https from 'https';
import fs from 'fs';

function createHttpServer(ssl?, requestListener?: http.RequestListener): http.Server | https.Server {
	if (ssl) {
		const ssl_options = {
			key: fs.readFileSync(ssl.keyfile),
			cert: fs.readFileSync(ssl.certfile),
		};
		return https.createServer(ssl_options, requestListener);
	}
	return http.createServer(requestListener);
}

export default function createProxyServer({ host, port, ssl, defaultPath = '/' }) {
	const server = createHttpServer(ssl, async (req: http.IncomingMessage | IncomingMessage, res: http.ServerResponse) => {
		const options = {
			hostname: host,
			port: port,
			path: req.url,
			method: req.method,
			headers: req.headers,
		};
		const proxyReq = http.request(options, (proxyRes) => {
			if (proxyRes.statusCode === 404) {
				const proxyReq2 = http.request({ ...options, path: defaultPath }, (proxyRes2) => {
					res.writeHead(proxyRes2.statusCode, proxyRes2.headers);
					proxyRes2.pipe(res, { end: true });
				});
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
