// user.service.ts
import type { UpdateFilter, WithId } from 'mongodb';
import type { IUser } from '@/models/auth.models';
import type { IUserQuery } from '@/validators/user.validator';
import { ERROR_MESSAGES } from '@/constants/error.constants';
import NotFoundException from '@/exceptions/not-found.exception';
import { userRepository } from '@/Repositories/user.repository';
import { USER_ENTITY_STATUS } from '@/constants/db.constants';

export class UserService {
  // Service speaks domain language — no MongoDB types, no filter construction
  public async getAllUsers(query: IUserQuery) {
    const {
      limit = 10,
      skip = 0,
      search_key,
      sort_by = 'createdAt',
      sort_order,
      emailVerified,
      banned,
      role
    } = query;

    return userRepository.search(
      { search_key, emailVerified, banned, role },
      { limit, skip, sort_by, sort_order }
    );
  }

  public async countUsers(banned?: boolean, status?: USER_ENTITY_STATUS) {
    return userRepository.countByBanned(banned);
  }

  public async findUserById(id: string): Promise<WithId<IUser>> {
    const user = await userRepository.findById(id);
    if (!user) throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    return user;
  }

  public async findUserByEmail(email: string): Promise<WithId<IUser>> {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    return user;
  }

  public async updateUserById(id: string, update: UpdateFilter<IUser>): Promise<WithId<IUser>> {
    const updatedUser = await userRepository.updateById(id, update);
    if (!updatedUser) throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    return updatedUser;
  }
}

export default new UserService();
