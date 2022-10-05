const path = require("path");
const multer = require("multer");

const image_types = ["image/png", "image/jpg", "image/jpeg"];

const image_file_filter = (request, file, cb) => {
  if (image_types.indexOf(file.mimetype) !== -1) cb(null, true);
  else cb(null, false);
};

const image_file_uploader = multer({
  storage: multer.diskStorage({
    destination: (request, file, done) => {
      done(null, "./images");
    },
    filename: (request, file, done) => {
      const file_name =
        request.session.user_email +
        Date.now() +
        path.extname(file.originalname);
      done(null, file_name);
    },
  }),
  fileFilter: image_file_filter,
  limits: { fileSize: 30 * 1024 * 1024 },
}).array("images");

module.exports = image_file_uploader;
