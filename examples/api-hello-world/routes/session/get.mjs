
export default async function (req, res) {
  return res.json({ ok: true, session: req.session });
}