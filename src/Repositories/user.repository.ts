// user.repository.ts
import type { Filter } from 'mongodb';
import type { IUser } from '@/models/auth.models';
import { AuthRepository } from './auth.repository';
import { COLLECTIONS } from '@/constants/db.constants';

export interface UserSearchCriteria {
  search_key?: string;
  emailVerified?: boolean;
  banned?: boolean;
  role?: string;
}

class UserRepository extends AuthRepository<IUser> {
  constructor() {
    super(COLLECTIONS.USER);
  }

  public findByEmail = async (email: string) => this.findOne({ email });

  public findByRole = async (role: string) => this.findMany({ role });

  public search = async (
    criteria: UserSearchCriteria,
    options: { limit?: number; skip?: number; sort_by?: string; sort_order?: 'asc' | 'desc' }
  ) => {
    const filter: Filter<IUser> = {};

    if (criteria.search_key) {
      filter.$or = [
        { name: { $regex: criteria.search_key, $options: 'i' } },
        { phoneNumber: { $regex: criteria.search_key, $options: 'i' } }
      ];
    }

    if (typeof criteria.emailVerified !== 'undefined') {
      filter.emailVerified = criteria.emailVerified;
    }

    if (typeof criteria.banned !== 'undefined') {
      filter.banned = criteria.banned;
    }

    if (criteria.role) {
      filter.role = criteria.role;
    }

    return this.findAll(filter, options);
  };

  public countByBanned = async (banned?: boolean) =>
    this.countDocuments(typeof banned !== 'undefined' ? { banned } : {});

  public updateRole = async (id: string, role: string) =>
    this.updateOne({ id }, { $set: { role } });
}

export const userRepository = new UserRepository();
