import { AUDIT_ACTION, AUDIT_ENTITY_TYPE, AUDIT_STATUS } from '@/constants/audit-log.constants';
import pkg from 'lodash';
import { date, mixed, object, string } from 'yup';
import { paginationQuerySchema } from '../common.schema';

/**
 * Audit log query schema
 * Extends the common pagination schema with audit log-specific filters
 */
export const auditLogQuerySchema = paginationQuerySchema.concat(
  object({
    // Filter by entity type
    entityType: mixed<AUDIT_ENTITY_TYPE>().oneOf(pkg.values(AUDIT_ENTITY_TYPE)).optional(),

    // Filter by action
    action: mixed<AUDIT_ACTION>().oneOf(pkg.values(AUDIT_ACTION)).optional(),

    // Filter by status
    status: mixed<AUDIT_STATUS>().oneOf(pkg.values(AUDIT_STATUS)).optional(),

    // Filter by actor ID
    actorId: string().optional(),

    // Filter by entity ID
    entityId: string().optional(),

    // Date range filtering
    dateFrom: date().optional(),
    dateTo: date().optional()
  })
);
