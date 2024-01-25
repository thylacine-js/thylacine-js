import bodyParser from "body-parser";
import { IncomingMessage } from "http";

const bufferRawBody = bodyParser.raw({
  verify: (req: IncomingMessage & { rawBody?: string }, res, buf, encoding?: BufferEncoding) => {
    if (buf && buf.length) {
      req.rawBody = buf.toString(encoding || "utf8");
    }
  },
  type: "*/*",
});

export default bufferRawBody;
