import { AUDIT_ACTION, AUDIT_ENTITY_TYPE, AUDIT_STATUS } from '@/constants/audit-log.constants';
import { OmitBaseEntity } from '@/constants/common.constants';
import { IAuditLog } from '@/models/audit-log.model';
import auditLogService from '@/services/audit-log.service';
import { Types } from 'mongoose';

/**
 * Simple audit logging - just log what happened
 *
 * Usage Examples:
 *
 * // Log user creation
 * await auditLog(userId, 'USER', 'User created account')
 *
 * // Log admin generating entry codes
 * await auditLog(codeId, 'ENTRY_CODE', 'Generated entry codes', adminId)
 *
 * // Log with extra data
 * await auditLog(userId, 'USER', 'Password changed', userId, { method: 'self-service' })
 */
export const auditLog = async (
  entityId: string | Types.ObjectId,
  entityType: string,
  reason: string,
  actorId?: string | Types.ObjectId,
  data?: any
): Promise<void> => {
  try {
    const auditData: OmitBaseEntity<IAuditLog> = {
      entityId: new Types.ObjectId(entityId),
      entityType: entityType as AUDIT_ENTITY_TYPE,
      actorId: new Types.ObjectId(actorId || entityId),
      action: AUDIT_ACTION.CREATE, // Default action
      previousValues: {},
      newValues: data || {},
      reason,
      status: AUDIT_STATUS.SUCCESS,
      timestamp: new Date()
    };

    await auditLogService.create(auditData);
  } catch (error) {
    console.error('Audit logging failed:', error);
    // Don't throw - audit logging shouldn't break the main flow
  }
};
