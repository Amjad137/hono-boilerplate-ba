import { yupValidator } from '@/middlewares/yup-validator.middleware';
import { InferType } from 'yup';
import { userEditSchema } from './schema/user/user-edit.schema';
import { userCountQuerySchema, userQuerySchema } from './schema/user/user-query.schema';

export const userQueryValidator = yupValidator('query', userQuerySchema);
export const userEditValidator = yupValidator('json', userEditSchema);
export const userCountQueryValidator = yupValidator('query', userCountQuerySchema);

export type IUserQuery = InferType<typeof userQuerySchema>;
export type IUserEdit = InferType<typeof userEditSchema>;
export type IUserCountQuery = InferType<typeof userCountQuerySchema>;
