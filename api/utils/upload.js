// const multer = require("multer");
// const multerS3 = require("multer-s3");
// const s3 = require("../config/awsconfig");

// // Configure multer storage to upload to S3
// const upload = multer({
//     storage: multerS3({
//         s3: s3,
//         bucket: "your-bucket-name", // Replace with your S3 bucket name
//         acl: "public-read", // Make files publicly accessible
//         metadata: (req, file, cb) => {
//             cb(null, { fieldName: file.fieldname });
//         },
//         key: (req, file, cb) => {
//             const fileExtension = file.originalname.split(".").pop();
//             const fileName = Date.now() + "-" + file.originalname;
//             cb(null, `uploads/profile-pictures/${fileName}`);
//         },
//     }),
//     limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
// });

// module.exports = upload;
