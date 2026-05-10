import { SYSTEM_ROLE } from '@/constants/user.constants';
import pkg from 'lodash';
import { mixed, object } from 'yup';

export const userProtectedSchema = object({
  role: mixed<SYSTEM_ROLE>().oneOf(pkg.values(SYSTEM_ROLE)).required()
});