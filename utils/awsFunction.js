require("express");
require("dotenv").config();
// Multer for Image Upload
const multer = require("multer");
const multerS3 = require("multer-s3");
// AWS
const { S3Client } = require("@aws-sdk/client-s3");

const { ACCESS_KEY, ACCESS_SECRET, REGION, AWS_BUCKET } = process.env;

const s3Client = new S3Client({
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: ACCESS_SECRET,
  },
  region: REGION,
});

const pictureS3Config = multerS3({
  s3: s3Client,
  bucket: AWS_BUCKET,
  metadata: function (req, file, cb) {
    cb(null, { fieldName: file.fieldname });
  },
  key: function (req, file, cb) {
    cb(null, "images/" + file.originalname);
  },
});

exports.uploadPicture = multer({
  storage: pictureS3Config,
  limits: {
    fileSize: 1024 * 1024 * 10,
    // here 10 means 10mb image size
    // If needed... We can change the image size
  },
});
