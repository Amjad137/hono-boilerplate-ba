import { yupValidator } from '@/middlewares/yup-validator.middleware';
import { auditLogQuerySchema } from './schema/audit-logs/audit-log-query.schema';
import { InferType } from 'yup';

export const auditLogQueryValidator = yupValidator('query', auditLogQuerySchema);

export type IAuditLogQuery = InferType<typeof auditLogQuerySchema>;
