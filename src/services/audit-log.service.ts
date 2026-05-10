import { ENTITY_SORT } from '@/constants/db.constants';
import { ERROR_MESSAGES } from '@/constants/error.constants';
import NotFoundException from '@/exceptions/not-found.exception';
import auditLogRepository from '@/Repositories/audit-log.repository';
import { IAuditLogQuery } from '@/validators/audit-log.validator';
import { PopulateOptions } from 'mongoose';

export class AuditLogService {
  public getAllAuditLogs = async (query: IAuditLogQuery) => {
    const {
      limit = 10,
      skip = 0,
      search_key,
      sort_by = 'timestamp',
      sort_order = ENTITY_SORT.DESC,
      hide_deleted,
      dateFrom,
      dateTo,
      ...filterParams
    } = query;

    return auditLogRepository.search(
      { search_key, dateFrom, dateTo },
      {
        limit,
        skip,
        sort_by,
        sort_order,
        ...filterParams
      }
    );
  };

  public findById = async (id: string) => {
    const auditLog = await auditLogRepository.findOneAndPopulate({ _id: id }, [
      { path: 'actorId', select: 'firstName lastName surname authUserId' }
    ]);

    if (!auditLog) {
      throw new NotFoundException(ERROR_MESSAGES.AUDIT_LOG_NOT_FOUND);
    }
    return auditLog;
  };

  public findByIdAndPopulate = async (
    id: string,
    sortOptions: { sort_by: string; sort_order: string },
    populateOptions: PopulateOptions | (string | PopulateOptions)[]
  ) => {
    const auditLog = await auditLogRepository.findOneAndPopulate({ _id: id }, populateOptions);

    if (!auditLog) {
      throw new NotFoundException(ERROR_MESSAGES.AUDIT_LOG_NOT_FOUND);
    }
    return auditLog;
  };
}

export default new AuditLogService();
