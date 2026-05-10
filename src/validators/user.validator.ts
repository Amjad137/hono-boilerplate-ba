import { yupValidator } from '@/middlewares/yup-validator.middleware';
import { InferType } from 'yup';
import { userEditSchema } from './schema/user/user-edit.schema';
import { userPasswordSchema } from './schema/user/user-password.schema';
import { userPostSchema } from './schema/user/user-post.schema';
import { userProtectedSchema } from './schema/user/user-protected.schema';
import { userCountQuerySchema, userQuerySchema } from './schema/user/user-query.schema';
import { usersVerificationSchema } from './schema/user/user-verify.schema';
import { usersUpdateStatusSchema } from './schema/user/user-status-update.schema';

export const userQueryValidator = yupValidator('query', userQuerySchema);
export const userPostValidator = yupValidator('json', userPostSchema);
export const userEditValidator = yupValidator('json', userEditSchema);
export const userProtectedValidator = yupValidator('json', userProtectedSchema);
export const userPasswordValidator = yupValidator('json', userPasswordSchema);
export const usersVerifyValidator = yupValidator('json', usersVerificationSchema);
export const usersUpdateStatusValidator = yupValidator('json', usersUpdateStatusSchema);
export const userCountQueryValidator = yupValidator('query', userCountQuerySchema);

export type IUserQuery = InferType<typeof userQuerySchema>;
export type IUserPost = InferType<typeof userPostSchema>;
export type IUserEdit = InferType<typeof userEditSchema>;
export type IUserProtected = InferType<typeof userProtectedSchema>;
export type IUserPassword = InferType<typeof userPasswordSchema>;
export type IUsersVerification = InferType<typeof usersVerificationSchema>;
export type IUsersUpdateStatus = InferType<typeof usersUpdateStatusSchema>;
export type IUserCountQuery = InferType<typeof userCountQuerySchema>;
