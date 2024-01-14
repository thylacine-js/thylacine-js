import bodyParser from "body-parser";

let bufferRawBody = bodyParser.raw({
  verify: function (req, res, buf, encoding) {
    if (buf && buf.length) {
      req.rawBody = buf.toString(encoding || "utf8");
    }
  },
  type: "*/*",
});

export default bufferRawBody;
