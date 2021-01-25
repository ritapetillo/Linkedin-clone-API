const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
//multer settings
const userStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "users",
  },
});
const expStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "experiences",
  },
});
const userParser = multer({ userStorage });
const expParser = multer({ expStorage });


module.exports = { userParser, expParser };
