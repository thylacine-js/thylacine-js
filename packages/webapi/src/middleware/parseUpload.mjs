import multer from "multer";

const upload = multer({
  dest: process.env.TMP_DIR || "/tmp",
  limits: { fieldSize: 25 * 1024 * 1024 },
});

const parseMultipartBody = upload.any();

export default parseMultipartBody;