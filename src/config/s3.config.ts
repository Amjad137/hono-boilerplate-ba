import { S3Client } from '@aws-sdk/client-s3';
import environment from './env.config';

const S3 = new S3Client({
  region: environment.awsRegion,
  credentials: {
    accessKeyId: environment.awsAccessKeyId,
    secretAccessKey: environment.awsSecretAccessKey
  }
});

export default S3;
