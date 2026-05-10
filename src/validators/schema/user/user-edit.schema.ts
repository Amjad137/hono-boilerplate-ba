import { GENDER } from '@/constants/user.constants';
import pkg from 'lodash';
import { mixed, object, string } from 'yup';

export const userEditSchema = object({
  firstName: string().trim().optional(),
  lastName: string().trim().optional(),
  surname: string().trim().optional(),
  phoneNo: string().trim().optional(),
  address: string().trim().optional(),
  gender: mixed<GENDER>().oneOf(pkg.values(GENDER)).optional(),
  profilePicUrl: string().trim().url().optional()
});
