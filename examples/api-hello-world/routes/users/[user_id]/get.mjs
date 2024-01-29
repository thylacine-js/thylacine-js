export default async function (req, res) {
  const user_id = req.params.user_id;
  return res.json({ ok: true, user_id });
}
