import { boolean, object, string } from 'yup';

export const userPasswordSchema = object({
  currentPassword: string().required('Current password is required'),
  newPassword: string().required('New password is required'),
  revokeOtherSessions: boolean().optional()
});