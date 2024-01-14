export default async function (req, res) {
  req.session = null;
  res.cookie("session", null, {
    domain: process.env.COOKIE_DOMAIN,
    httpOnly: false,
  });
  res.cookie("session.sig", null, {
    domain: process.env.COOKIE_DOMAIN,
    httpOnly: false,
  });
  return res.json({ ok: true });
}
