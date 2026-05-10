import { USER_ENTITY_STATUS } from '@/constants/db.constants';
import { SYSTEM_ROLE } from '@/constants/user.constants';
import pkg from 'lodash';
import { boolean, mixed, object } from 'yup';
import { paginationQuerySchema } from '../common.schema';

/**
 * User query schema
 * Extends the common pagination schema with user-specific filters
 */
export const userQuerySchema = paginationQuerySchema.concat(
  object({
    // Filter by role - single or multiple
    role: mixed<SYSTEM_ROLE>().oneOf(pkg.values(SYSTEM_ROLE)),

    // Filter by status
    status: mixed<USER_ENTITY_STATUS>().oneOf(pkg.values(USER_ENTITY_STATUS)),

    // For admin queries - verified status
    verified: boolean().transform((value, originalValue) => {
      if (typeof originalValue === 'string') {
        if (originalValue.toLowerCase() === 'true') return true;
        if (originalValue.toLowerCase() === 'false') return false;
      }
      return value;
    })
  })
);

export const userCountQuerySchema = object({
  status: mixed<USER_ENTITY_STATUS>().oneOf(pkg.values(USER_ENTITY_STATUS))
});
