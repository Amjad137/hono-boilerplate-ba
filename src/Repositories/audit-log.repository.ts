import { ENTITY_SORT } from '@/constants/db.constants';
import { AuditLog, AuditLogModel, IAuditLog } from '@/models/audit-log.model';
import { FilterQuery } from 'mongoose';
import { BaseRepository } from './base.repository';

export interface AuditSearchCriteria {
  search_key?: string;
  dateFrom?: Date;
  dateTo?: Date;
  filterParams?: Record<string, any>;
}
export class AuditLogRepository extends BaseRepository<IAuditLog, AuditLogModel> {
  constructor() {
    super(AuditLog);
  }

  public search = async (
    criteria: AuditSearchCriteria,
    options: { limit?: number; skip?: number; sort_by?: string; sort_order?: ENTITY_SORT }
  ) => {
    const filters: FilterQuery<IAuditLog> = {};
    const { search_key, dateFrom, dateTo, ...filterParams } = criteria;

    if (search_key) {
      filters.$or = [
        { reason: { $regex: search_key, $options: 'i' } },
        { approvedBy: { $regex: search_key, $options: 'i' } },
        { entityType: { $regex: search_key, $options: 'i' } },
        { action: { $regex: search_key, $options: 'i' } }
      ];
    }
    // Date range filtering
    if (dateFrom || dateTo) {
      filters.timestamp = {};
      if (dateFrom) filters.timestamp.$gte = new Date(dateFrom);
      if (dateTo) filters.timestamp.$lte = new Date(dateTo);
    }

    // Apply any additional filters
    Object.entries(filterParams).forEach(([key, value]) => {
      if (value !== undefined) {
        filters[key] = Array.isArray(value) ? value[0] : value;
      }
    });

    return this.findAll(filters, options);
  };
}
export default new AuditLogRepository();
