const AWS = require("aws-sdk");

AWS.config.update({
  region: "<your-region>",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

exports.uploadS3 = async (body) => {
  try {
    const params = {
      Bucket: "<your-bucket-name>",
      Key: "myFile.txt",
      Body: body,
    };
    const data = await s3.upload(params);
    return data.Location;
  } catch (error) {
    console.log("something went wrong while uploading", error);
  }
};
