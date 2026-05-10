import { USER_ENTITY_STATUS } from '@/constants/db.constants';
import pkg from 'lodash';
import { array, mixed, object, string } from 'yup';

/**
 * Update Status of Multiple Users Schema
 */
export const usersUpdateStatusSchema = object({
  userIDs: array(string()).min(1).required(),

  status: mixed<USER_ENTITY_STATUS>().oneOf(pkg.values(USER_ENTITY_STATUS)).required()
});
