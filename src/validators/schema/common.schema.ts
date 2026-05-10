import { ENTITY_SORT } from '@/constants/db.constants';
import pkg from 'lodash';
import { date, mixed, number, object, string } from 'yup';

export const paginationQuerySchema = object({
  sort_order: mixed<ENTITY_SORT>().oneOf(pkg.values(ENTITY_SORT)).default(ENTITY_SORT.DESC),
  sort_by: string().default('createdAt'),
  limit: number().default(10).min(1).max(100),
  skip: number().default(0).min(0),
  created_from: date().optional(),
  created_to: date().optional(),
  search_key: string().trim().optional(),
  hide_deleted: mixed<boolean>().default(false)
});
