import { USER_ENTITY_STATUS } from '@/constants/db.constants';
import { GENDER } from '@/constants/user.constants';
import pkg from 'lodash';
import { boolean, mixed, object, string } from 'yup';

const addressSchema = object({
	line1: string().trim().required('Address line 1 is required'),
	line2: string().trim().optional(),
	city: string().trim().required('City is required'),
	region: string().trim().required('Region is required')
});

export const userPostSchema = object({
	authUserId: string().trim().required('Auth user ID is required'),
	firstName: string().trim().required('First name is required'),
	lastName: string().trim().required('Last name is required'),
	surname: string().trim().required('Surname is required'),
	phoneNo: string().trim().required('Phone number is required'),
	address: addressSchema.required(),
	gender: mixed<GENDER>().oneOf(pkg.values(GENDER)).required('Gender is required'),
	profilePicUrl: string().trim().url().optional(),
	verified: boolean().default(false),
	status: mixed<USER_ENTITY_STATUS>()
		.oneOf(pkg.values(USER_ENTITY_STATUS))
		.default(USER_ENTITY_STATUS.ACTIVE)
});
