import { yupValidator } from '@/middlewares/yup-validator.middleware';
import { paginationQuerySchema } from './schema/common.schema';
import { InferType } from 'yup';

export const paginationQueryValidator = yupValidator('query', paginationQuerySchema);

export type IPaginationQuery = InferType<typeof paginationQuerySchema>;
