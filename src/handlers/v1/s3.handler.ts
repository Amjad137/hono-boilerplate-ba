import BadRequestException from '@/exceptions/bad-request.exception';
import { HonoEnv } from '@/types/hono.type';
import s3Utils from '@/utils/s3.utils';
import {
  deleteFilesValidator,
  publicUploadValidator,
  secureUploadValidator
} from '@/validators/s3.validator';
import { Hono } from 'hono';
import { StatusCodes } from 'http-status-codes';

const s3Handler = new Hono<HonoEnv>();

/*-----------Upload Documents/Files Securely--------------*/
s3Handler.post('/protected-upload', secureUploadValidator, async (c) => {
  const { fileType, folder, keyCount = 1, oldKeys } = c.req.getValid('json');

  if (!s3Utils.validateImageType(fileType) && !s3Utils.validateDocumentType(fileType)) {
    throw new BadRequestException('Invalid file type for secure upload');
  }

  const uploads = await s3Utils.generateSecurePresignedUrl({
    keyCount,
    fileType,
    folder,
    oldKeys
  });

  return c.json(uploads, StatusCodes.OK);
});

/*-----------Upload Images Publicly--------------*/
s3Handler.post('/public-upload', publicUploadValidator, async (c) => {
  const { fileType, folder, keyCount = 1, oldKeys } = c.req.getValid('json');

  if (!s3Utils.validateImageType(fileType)) {
    throw new BadRequestException('Only images allowed for public upload');
  }

  const uploads = await s3Utils.generatePublicPresignedUrl({
    keyCount,
    fileType,
    folder,
    oldKeys
  });

  return c.json(uploads, StatusCodes.OK);
});

/*-----------Get File Access URL--------------*/
s3Handler.get('/file-url/:key', async (c) => {
  const key = c.req.param('key');
  const isSecure = c.req.query('secure') === 'true';

  const url = isSecure ? await s3Utils.getSecureFileUrl(key) : s3Utils.getPublicFileUrl(key);

  return c.json({ url }, StatusCodes.OK);
});

/*-----------Delete Files--------------*/
s3Handler.delete('/files', deleteFilesValidator, async (c) => {
  const { keys } = c.req.getValid('json');

  await s3Utils.deleteFiles(keys);
  return c.json({ message: `${keys.length} file(s) deleted` }, StatusCodes.OK);
});

export default s3Handler;
