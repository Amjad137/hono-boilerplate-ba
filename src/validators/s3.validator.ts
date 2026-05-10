import { yupValidator } from '@/middlewares/yup-validator.middleware';
import {
  presignedUrlSchema,
  deleteFilesSchema,
  publicUploadSchema
} from '@/validators/schema/s3/s3.schema';

// Secure upload request validation
export const secureUploadValidator = yupValidator('json', presignedUrlSchema);

// Public upload request validation
export const publicUploadValidator = yupValidator('json', publicUploadSchema);

// Delete files request validation
export const deleteFilesValidator = yupValidator('json', deleteFilesSchema);
