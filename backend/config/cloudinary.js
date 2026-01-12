import { v2 as cloudinary } from "cloudinary";
console.log("Cloudinary Config:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET ? "[HIDDEN]" : "NOT SET",
});

cloudinary.config({
  cloud_name:"dxckdnpmi",
  api_key:"719782311442648",
  api_secret:"KPEEkfA01ZakBJAZVjJmE7swPrI"
});

export default cloudinary;
