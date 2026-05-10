import { ENVIRONMENTS } from '@/constants';
import { VERSION } from '@/version';
import { config } from 'dotenv';
import dotenvExpand from 'dotenv-expand';

const env = config();
dotenvExpand.expand(env);

const environment = {
  isDebugMode:
    process.env.NODE_ENV === ENVIRONMENTS.DEV || process.env.NODE_ENV === ENVIRONMENTS.TEST,
  port: process.env.PORT ? Number(process.env.PORT) : 8000,
  env: process.env.NODE_ENV as ENVIRONMENTS,
  packageName: process.env.PACKAGE_NAME as string,
  packageVersion: VERSION,
  databaseURI: process.env.MONGODB_URI as string,
  apiUrl: process.env.API_URL as string,
  clientUrl: process.env.CLIENT_URL as string,
  betterAuthSecret: process.env.BETTER_AUTH_SECRET as string,

  //Resend Configuration
  resendApiKey: process.env.RESEND_API_KEY as string,
  resendFromEmail: process.env.RESEND_FROM_EMAIL as string,

  // AWS S3 Configuration
  awsRegion: process.env.AWS_REGION as string,
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  s3BucketName: process.env.S3_BUCKET_NAME as string,

  // S3 Folder Configuration
  s3DefaultFolder: process.env.S3_DEFAULT_FOLDER as string,
  s3ProfileImagesFolder: process.env.S3_PROFILE_IMAGES_FOLDER as string,
  s3EventImagesFolder: process.env.S3_EVENT_IMAGES_FOLDER as string,
  s3DocumentsFolder: process.env.S3_DOCUMENTS_FOLDER as string
};

export default environment;
