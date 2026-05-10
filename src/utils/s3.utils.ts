import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomBytes } from 'crypto';
import environment from '../config/env.config';
import S3 from '../config/s3.config';

export interface IPresignedUrlResponse {
  key: string;
  presignedUrl: string;
}

export interface IPublicUploadResponse extends IPresignedUrlResponse {
  publicUrl: string;
}

export interface IUploadRequestData {
  keyCount: number;
  fileType: string;
  folder: string;
  oldKeys?: string[];
}

/**
 * Generate unique S3 key
 */
const generateKey = (folder: string, fileType: string, isPublic = false): string => {
  const timestamp = Date.now();
  const randomKey = randomBytes(16).toString('hex');

  const prefix = isPublic ? 'public' : 'protected';
  const result = `${prefix}/${folder}/${timestamp}-${randomKey}`;

  return result;
};

/**
 * Generate presigned URLs for uploads
 */
const generatePresignedUrl = async (
  keyCount: number,
  fileType: string,
  folder: string,
  isPublic = false
): Promise<IPresignedUrlResponse[]> => {
  const uploads: IPresignedUrlResponse[] = [];

  for (let i = 0; i < keyCount; i++) {
    const key = generateKey(folder, fileType, isPublic);
    const params: any = {
      Bucket: environment.s3BucketName,
      Key: key,
      ContentType: fileType
    };

    const command = new PutObjectCommand(params);
    const presignedUrl = await getSignedUrl(S3, command, { expiresIn: 900 });

    uploads.push({ key, presignedUrl });
  }

  return uploads;
};

/**
 * Generate public presigned URLs with public URL
 */
const generatePublicPresignedUrl = async (
  request: IUploadRequestData
): Promise<IPublicUploadResponse[]> => {
  if (request.oldKeys?.length) {
    await deleteFiles(request.oldKeys);
  }

  const uploads = await generatePresignedUrl(
    request.keyCount,
    request.fileType,
    request.folder,
    true
  );

  return uploads.map((upload) => ({
    ...upload,
    publicUrl: `https://${environment.s3BucketName}.s3.${environment.awsRegion}.amazonaws.com/${upload.key}`
  }));
};

/**
 * Generate secure presigned URLs for documents/private files
 */
const generateSecurePresignedUrl = async (
  request: IUploadRequestData
): Promise<IPresignedUrlResponse[]> => {
  if (request.oldKeys?.length) {
    await deleteFiles(request.oldKeys);
  }

  return generatePresignedUrl(request.keyCount, request.fileType, request.folder, false);
};

/**
 * Get secure file access URL
 */
const getSecureFileUrl = async (key: string): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: environment.s3BucketName,
    Key: key
  });
  return getSignedUrl(S3, command, { expiresIn: 900 });
};

/**
 * Get public file URL
 */
const getPublicFileUrl = (key: string): string => {
  return `https://${environment.s3BucketName}.s3.${environment.awsRegion}.amazonaws.com/${key}`;
};

/**
 * Delete files from S3
 */
const deleteFiles = async (keys: string[]): Promise<void> => {
  const commands = keys.map((key) =>
    S3.send(
      new DeleteObjectCommand({
        Bucket: environment.s3BucketName,
        Key: key
      })
    )
  );

  await Promise.all(commands);
};

/**
 * Validate image file types
 */
const validateImageType = (contentType: string): boolean => {
  return ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(contentType.toLowerCase());
};

/**
 * Validate document file types
 */
const validateDocumentType = (contentType: string): boolean => {
  const types = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  return types.includes(contentType.toLowerCase());
};

export default {
  generatePublicPresignedUrl,
  generateSecurePresignedUrl,
  getSecureFileUrl,
  getPublicFileUrl,
  deleteFiles,
  validateImageType,
  validateDocumentType
};
