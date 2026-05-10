import { IBaseEntity } from '@/constants/common.constants';
import { COLLECTIONS, USER_ENTITY_STATUS } from '@/constants/db.constants';
import { GENDER, SYSTEM_ROLE } from '@/constants/user.constants';
import UnauthorizedException from '@/exceptions/unauthorized.exception';
import { Model, model, Query, Schema } from 'mongoose';
import { AuditLog } from './audit-log.model';

export interface IUser extends IBaseEntity {
  name: string;
  email: string;
  emailVerified: boolean;
  phoneNumber: string;
  image?: string;
  role: SYSTEM_ROLE;
  banned?: boolean;
  banReason?: string;
  banExpires?: Date;
  username: string;
  displayUsername?: string;

  status: USER_ENTITY_STATUS;
  gender: GENDER;
}

export interface UserModel extends Model<IUser> {}

const UserProfileSchema = new Schema<IUser, UserModel>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    emailVerified: { type: Boolean, required: true, default: false },
    phoneNumber: { type: String, required: true },
    image: { type: String, required: false },
    role: { type: String, enum: SYSTEM_ROLE, required: true, default: SYSTEM_ROLE.USER },
    banned: { type: Boolean, default: false },
    banReason: { type: String },
    banExpires: { type: Date },
    username: { type: String, required: true, unique: true },
    displayUsername: { type: String },

    status: {
      type: String,
      enum: USER_ENTITY_STATUS,
      default: USER_ENTITY_STATUS.ACTIVE,
      required: true
    },
    gender: {
      type: String,
      enum: GENDER,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const protectUserDeletion = async function (
  this: Query<IUser, UserModel>,
  next: (err?: Error) => void
) {
  // `this` is the Mongoose query
  const userFilter = this.getFilter();
  // We use .find() here as it works for both single and multiple document deletions
  const usersToDelete = await this.model.find(userFilter).select('_id').lean();

  if (usersToDelete.length > 0) {
    const userIds = usersToDelete.map((u) => u._id);

    // Check for associated records
    const auditCount = await AuditLog.countDocuments({ actorId: { $in: userIds } });

    if (auditCount > 0) {
      return next(
        new UnauthorizedException(
          'Cannot delete user that has associated records. Please remove all associated data first.'
        )
      );
    }
  }
  next();
};

UserProfileSchema.pre('findOneAndDelete', { document: false, query: true }, protectUserDeletion);
UserProfileSchema.pre('deleteOne', { document: false, query: true }, protectUserDeletion);
UserProfileSchema.pre('deleteMany', { document: false, query: true }, protectUserDeletion);

export const User = model<IUser, UserModel>(COLLECTIONS.USER, UserProfileSchema);
