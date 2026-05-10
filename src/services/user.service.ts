import { AUTH_USER_MODEL_NAME } from '@/config/better-auth';
import { getMongoDb } from '@/config/db.config';
import { USER_ENTITY_STATUS } from '@/constants/db.constants';
import { SYSTEM_ROLE } from '@/constants/user.constants';
import { IUserProfile, UserProfile, UserProfileModel } from '@/models/user.model';
import { CommonDatabaseService } from './common-database.service';
import { FilterQuery, Types } from 'mongoose';

type AuthUserRecord = {
  _id: Types.ObjectId;
  role?: SYSTEM_ROLE;
};

export class UserService extends CommonDatabaseService<IUserProfile, UserProfileModel> {
  constructor() {
    super(UserProfile);
  }

  public async findByAuthUserId(authUserId: string): Promise<IUserProfile | null> {
    return this.model.findOne({ authUserId });
  }

  public async authUserExists(authUserId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(authUserId)) {
      return false;
    }
    const authUser = await getMongoDb()
      .collection<AuthUserRecord>(AUTH_USER_MODEL_NAME)
      .findOne({ _id: new Types.ObjectId(authUserId) }, { projection: { _id: 1 } });

    return !!authUser;
  }

  public async findAuthUserIdsByRole(role: SYSTEM_ROLE): Promise<string[]> {
    const authUsers = await getMongoDb()
      .collection<AuthUserRecord>(AUTH_USER_MODEL_NAME)
      .find({ role }, { projection: { _id: 1 } })
      .toArray();

    return authUsers.map((authUser) => authUser._id.toString());
  }

  public async updateAuthUserRole(authUserId: string, role: SYSTEM_ROLE): Promise<boolean> {
    if (!Types.ObjectId.isValid(authUserId)) {
      return false;
    }

    const result = await getMongoDb()
      .collection<AuthUserRecord>(AUTH_USER_MODEL_NAME)
      .updateOne({ _id: new Types.ObjectId(authUserId) }, { $set: { role } });

    return result.matchedCount > 0;
  }

  public async searchProfiles(
    filters: FilterQuery<IUserProfile>,
    options?: {
      sort_by?: string;
      sort_order?: 'asc' | 'desc';
      limit?: number;
      skip?: number;
    }
  ) {
    const total = await this.model.countDocuments(filters);

    let query = this.model.find(filters);
    const sortField = options?.sort_by ?? 'createdAt';
    const sortOrder = options?.sort_order === 'asc' ? 1 : -1;
    query = query.sort({ [sortField]: sortOrder });

    if (options?.skip !== undefined && options.skip >= 0) {
      query = query.skip(options.skip);
    }

    if (options?.limit !== undefined && options.limit > 0) {
      query = query.limit(options.limit);
    }

    const results = await query.exec();

    return {
      results,
      extras: {
        total,
        limit: options?.limit,
        skip: options?.skip
      }
    };
  }

  public async countUsers(status?: USER_ENTITY_STATUS): Promise<number> {
    const query: FilterQuery<IUserProfile> = {};
    if (status !== undefined) {
      query.status = status;
    }
    return this.model.countDocuments(query);
  }
}

export default new UserService();
