const multer = require("multer");
const path = require("path");

const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (process.env.NODE_ENV === "development") {
      cb(null, path.join(__dirname, "../public/images"));
    }
    if (process.env.NODE_ENV === "test") {
      cb(null, path.join(__dirname, "../public/test-images"));
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}.jpeg`);
  },
});

const multerFilter = function (req, file, cb) {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb({ message: "Unsupported file format" }, false);
  }
};

const fileUpload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})

module.exports = fileUpload