import AWS from 'aws-sdk';
import fs from 'fs';
import mergedEnvironmentConfig from '../../config/env.config';

// AWS?.config?.httpOptions.connectTimeout = 600000;
// AWS?.config?.httpOptions.timeout = 600000;

const s3 = new AWS.S3({
  accessKeyId: mergedEnvironmentConfig.default.s3.accessKeyId,
  secretAccessKey: mergedEnvironmentConfig.default.s3.secretAccessKey,
  region: mergedEnvironmentConfig.default.s3.region,
});

const uploadToS3 = async (imageToUpload: any) => {
  try {
    console.log(`config: ${JSON.stringify(mergedEnvironmentConfig.default.s3)}`);
    const blob = fs.readFileSync(imageToUpload?.path);
    return await s3
      .upload(
        {
          Bucket: mergedEnvironmentConfig.default.s3.bucket,
          Key: imageToUpload.filename,
          Body: blob,
        },
        {
          queueSize: 1,
        },
      )
      .promise();
  } catch (error) {
    throw error;
  }
};

export default uploadToS3;
