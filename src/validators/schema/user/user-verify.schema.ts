import { array, boolean, object, string } from 'yup';

/**
 * Verify / Non verify Multiple Users Schema
 */
export const usersVerificationSchema = object({
  userIDs: array(string()).min(1).required('User IDs are required'),
  verification: boolean().required()
});
