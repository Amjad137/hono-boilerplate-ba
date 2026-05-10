import { ENTITY_SORT } from '@/constants/db.constants';
import { ERROR_MESSAGES } from '@/constants/error.constants';
import BadRequestException from '@/exceptions/bad-request.exception';
import { validateSuperAdmin, validateUser } from '@/middlewares/auth.middlewares';
import auditLogService from '@/services/audit-log.service';
import { HonoEnv } from '@/types/hono.type';
import { auditLogQueryValidator } from '@/validators/audit-log.validator';
import { Hono } from 'hono';
import { StatusCodes } from 'http-status-codes';
import { isValidObjectId } from 'mongoose';

const auditLogHandler = new Hono<HonoEnv>();

/*-----------Get All Audit Logs--------------*/
auditLogHandler.get('/', validateUser, validateSuperAdmin, auditLogQueryValidator, async (c) => {
  const query = c.req.getValid('query');

  const auditLogs = await auditLogService.getAllAuditLogs(query);
  return c.json(auditLogs, StatusCodes.OK);
});

/*-----------Get Single Audit Log by ID--------------*/
auditLogHandler.get('/:id', validateUser, validateSuperAdmin, async (c) => {
  const id = c.req.param('id');

  const auditLog = await auditLogService.findById(id);

  return c.json({ auditLog }, StatusCodes.OK);
});

/*-----------Get Audit Logs by Entity--------------*/
auditLogHandler.get('/entity/:entityId', validateUser, validateSuperAdmin, async (c) => {
  const entityId = c.req.param('entityId');

  if (!isValidObjectId(entityId)) {
    throw new BadRequestException(ERROR_MESSAGES.INVALID_OBJECT_ID);
  }

  const auditLogs = await auditLogService.findByIdAndPopulate(
    entityId,
    { sort_by: 'timestamp', sort_order: ENTITY_SORT.DESC },
    [{ path: 'actorId', select: 'firstName lastName surname authUserId' }]
  );

  return c.json(auditLogs, StatusCodes.OK);
});

export default auditLogHandler;
