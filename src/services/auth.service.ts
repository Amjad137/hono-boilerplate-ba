import { SYSTEM_ROLE } from '@/constants/user.constants';

import BadRequestException from '@/exceptions/bad-request.exception';
import { Types } from 'mongoose';

export class AuthService {
  /**
   * Creates a user's role-specific profile based on their role
   * @param role The user's role
   * @param userId The user's MongoDB ObjectId
   * @param userData The update data containing role-specific fields
   * @returns Promise<void>
   */
  public async createUserProfile(role: SYSTEM_ROLE, userId: Types.ObjectId): Promise<void> {
    switch (role) {
      case SYSTEM_ROLE.ADMIN:
        // This role doesn't require specific profiles
        break;

      default:
        throw new BadRequestException('Invalid role for profile creation');
    }
  }

  /**
   * Updates a user's role-specific profile based on their role
   * @param role The user's role
   * @param userId The user's MongoDB ObjectId
   * @param userData The update data containing role-specific fields
   * @returns Promise<void>
   */
  public async updateUserProfile(role: SYSTEM_ROLE, userId: Types.ObjectId): Promise<void> {
    switch (role) {
      case SYSTEM_ROLE.ADMIN:
        // This role doesn't require specific profiles
        break;

      default:
        throw new BadRequestException('Invalid role for profile update');
    }
  }
}
export default new AuthService();
