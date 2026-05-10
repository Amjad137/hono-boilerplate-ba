import { AUDIT_ACTION, AUDIT_ENTITY_TYPE } from '@/constants/audit-log.constants';
import { Types } from 'mongoose';
export interface IUpdateUserByAdminDTO {
  approvedBy?: Types.ObjectId;
  reason: string;
  entityType: AUDIT_ENTITY_TYPE;
  action: AUDIT_ACTION;
}
