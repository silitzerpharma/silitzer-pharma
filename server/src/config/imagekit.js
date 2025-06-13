// backend/utils/imagekit.js
const ImageKit = require("imagekit");

const imagekit = new ImageKit({
  publicKey: "public_/S7k9spBtb2b2yxWwQwJyTBff9c=",
  privateKey: "private_7LBKA2Sr09i+wePWv5ahjYmNpUY=",
  urlEndpoint: "https://ik.imagekit.io/silitzerpharmaimg",
});

module.exports = imagekit;
