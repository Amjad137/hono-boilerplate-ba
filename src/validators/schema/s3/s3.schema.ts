import { array, number, object, string } from 'yup';

// Schema for protected presigned URL requests
export const presignedUrlSchema = object({
  fileType: string()
    .required('File type is required')
    .test(
      'valid-image-type',
      'Invalid file type. Only JPEG, PNG, and WebP are allowed.',
      (value) => {
        if (!value) return false;
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        return allowedTypes.includes(value.toLowerCase());
      }
    ),
  folder: string()
    .optional()
    .default('uploads')
    .test('valid-folder', 'Invalid folder name', (value) => {
      if (!value) return true;
      // Allow alphanumeric, hyphens, and forward slashes for nested folders
      return /^[a-zA-Z0-9\-\/]+$/.test(value);
    }),
  keyCount: number()
    .optional()
    .default(1)
    .min(1, 'Key count must be at least 1')
    .max(10, 'Maximum 10 URLs can be generated at once'),
  oldKeys: array(string().required('Each key must be a string'))
    .optional()
    .max(10, 'Maximum 10 old keys can be provided') // For replacing existing files
});

// Schema for public upload requests (reuse the presigned URL schema)
export const publicUploadSchema = presignedUrlSchema.clone();

// Schema for delete files requests
export const deleteFilesSchema = object({
  keys: array(string().required('Each key must be a string'))
    .min(1, 'At least one key is required')
    .max(10, 'Maximum 10 files can be deleted at once')
    .required('Keys array is required')
});
