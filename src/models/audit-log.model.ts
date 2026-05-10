import { AUDIT_ACTION, AUDIT_ENTITY_TYPE, AUDIT_STATUS } from '@/constants/audit-log.constants';
import { IBaseEntity } from '@/constants/common.constants';
import { COLLECTIONS } from '@/constants/db.constants';
import { Model, Schema, Types, model } from 'mongoose';

export interface IAuditLog extends IBaseEntity {
  // What entity was modified
  entityId: Types.ObjectId;
  entityType: AUDIT_ENTITY_TYPE;

  // Who made the change
  actorId: Types.ObjectId;

  // What happened
  action: AUDIT_ACTION; // What action was performed
  previousValues: Record<string, any>;
  newValues: Record<string, any>;

  // Why & metadata
  reason: string;
  approvedBy?: string;
  status: AUDIT_STATUS;
  error?: string;
  timestamp: Date;
}

export interface AuditLogModel extends Model<IAuditLog> {}

const AuditLogSchema = new Schema<IAuditLog, AuditLogModel>(
  {
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true
    },
    entityType: {
      type: String,
      required: true,
      index: true
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: COLLECTIONS.USER,
      required: true,
      index: true
    },
    action: {
      type: String,
      required: true,
      enum: AUDIT_ACTION,
      index: true
    },
    previousValues: { type: Schema.Types.Mixed },
    newValues: { type: Schema.Types.Mixed },
    reason: { type: String, required: true },
    approvedBy: { type: String },
    status: {
      type: String,
      default: AUDIT_STATUS.SUCCESS,
      enum: AUDIT_STATUS,
      index: true
    },
    error: { type: String },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for common queries
AuditLogSchema.index({ entityType: 1, entityId: 1 });
AuditLogSchema.index({ timestamp: -1, entityType: 1 });
AuditLogSchema.index({ actorId: 1, timestamp: -1 });

export const AuditLog = model<IAuditLog, AuditLogModel>(COLLECTIONS.AUDIT_LOGS, AuditLogSchema);
