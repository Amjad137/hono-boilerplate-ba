import { AuditLog, AuditLogModel, IAuditLog } from '@/models/audit-log.model';
import { CommonDatabaseService } from './common-database.service';

export class AuditLogService extends CommonDatabaseService<IAuditLog, AuditLogModel> {
  constructor() {
    super(AuditLog);
  }
}
export default new AuditLogService();
