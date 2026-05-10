import { ENTITY_SORT } from '@/constants/db.constants';
import { ERROR_MESSAGES } from '@/constants/error.constants';
import BadRequestException from '@/exceptions/bad-request.exception';
import NotFoundException from '@/exceptions/not-found.exception';
import { validateSuperAdmin, validateUser } from '@/middlewares/auth.middlewares';
import { IAuditLog } from '@/models/audit-log.model';
import auditLogService from '@/services/audit-log.service';
import { HonoEnv } from '@/types/hono.type';
import { auditLogQueryValidator, IAuditLogQuery } from '@/validators/audit-log.validator';
import { Hono } from 'hono';
import { StatusCodes } from 'http-status-codes';
import { FilterQuery, isValidObjectId } from 'mongoose';

const auditLogHandler = new Hono<HonoEnv>();

/*-----------Get All Audit Logs--------------*/
auditLogHandler.get('/', validateUser, validateSuperAdmin, auditLogQueryValidator, async (c) => {
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
  }: IAuditLogQuery = c.req.getValid('query');

  const filters: FilterQuery<IAuditLog> = {};

  // Handle search across multiple fields
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

  const auditLogs = await auditLogService.findAllAndPopulate(
    filters,
    {
      sort_by,
      sort_order,
      skip,
      limit,
      hide_deleted
    },
    [{ path: 'actorId', select: 'firstName lastName surname authUserId' }]
  );

  return c.json(auditLogs, StatusCodes.OK);
});

/*-----------Get Single Audit Log by ID--------------*/
auditLogHandler.get('/:id', validateUser, validateSuperAdmin, async (c) => {
  const id = c.req.param('id');

  if (!isValidObjectId(id)) {
    throw new BadRequestException(ERROR_MESSAGES.INVALID_OBJECT_ID);
  }

  const auditLog = await auditLogService.findOneAndPopulate({ _id: id }, [
    { path: 'actorId', select: 'firstName lastName surname authUserId' }
  ]);

  if (!auditLog) {
    throw new NotFoundException(ERROR_MESSAGES.AUDIT_LOG_NOT_FOUND);
  }

  return c.json({ auditLog }, StatusCodes.OK);
});

/*-----------Get Audit Logs by Entity--------------*/
auditLogHandler.get('/entity/:entityId', validateUser, validateSuperAdmin, async (c) => {
  const entityId = c.req.param('entityId');

  if (!isValidObjectId(entityId)) {
    throw new BadRequestException(ERROR_MESSAGES.INVALID_OBJECT_ID);
  }

  const auditLogs = await auditLogService.findAllAndPopulate(
    { entityId },
    { sort_by: 'timestamp', sort_order: ENTITY_SORT.DESC },
    [{ path: 'actorId', select: 'firstName lastName surname authUserId' }]
  );

  return c.json(auditLogs, StatusCodes.OK);
});

export default auditLogHandler;
