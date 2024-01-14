// echoing websocket
export default async function (ws, req) {
  const session = req.session;
  ws.on("message", function (msg) {
    ws.send(
      JSON.stringify({
        ok: true,
        msg,
        session,
      })
    );
  });
}