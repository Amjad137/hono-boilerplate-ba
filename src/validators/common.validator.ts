import { yupValidator } from '@/middlewares/yup-validator.middleware';
import { paginationQuerySchema } from './schema/common.schema';

export const paginationQueryValidator = yupValidator('query', paginationQuerySchema);
