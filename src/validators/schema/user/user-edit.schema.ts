import { GENDER } from '@/constants/user.constants';
import pkg from 'lodash';
import { mixed, object, string } from 'yup';

const addressSchema = object({
	line1: string().trim().required(),
	line2: string().trim().optional(),
	city: string().trim().required(),
	region: string().trim().required()
});

export const userEditSchema = object({
	firstName: string().trim().optional(),
	lastName: string().trim().optional(),
	surname: string().trim().optional(),
	phoneNo: string().trim().optional(),
	address: addressSchema.optional(),
	gender: mixed<GENDER>().oneOf(pkg.values(GENDER)).optional(),
	profilePicUrl: string().trim().url().optional()
});
