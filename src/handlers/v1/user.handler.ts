import { USER_ENTITY_STATUS } from '@/constants/db.constants';
import { ERROR_MESSAGES } from '@/constants/error.constants';
import { SYSTEM_ROLE } from '@/constants/user.constants';
import BadRequestException from '@/exceptions/bad-request.exception';
import ConflictException from '@/exceptions/conflict.exception';
import NotFoundException from '@/exceptions/not-found.exception';
import UnauthorizedException from '@/exceptions/unauthorized.exception';
import {
  validateAdmin,
  validateAdminOrSuperAdmin,
  validateUser
} from '@/middlewares/auth.middlewares';
import { auth } from '@/config/better-auth';
import { IUserProfile } from '@/models/user.model';
import userService from '@/services/user.service';
import { HonoEnv } from '@/types/hono.type';
import {
  IUserCountQuery,
  IUserEdit,
  IUserPassword,
  IUserPost,
  IUserProtected,
  IUserQuery,
  IUsersUpdateStatus,
  IUsersVerification,
  userCountQueryValidator,
  userEditValidator,
  userPasswordValidator,
  userPostValidator,
  userProtectedValidator,
  userQueryValidator,
  usersUpdateStatusValidator,
  usersVerifyValidator
} from '@/validators/user.validator';
import { Hono } from 'hono';
import { StatusCodes } from 'http-status-codes';
import pkg from 'lodash';
import { FilterQuery, isValidObjectId } from 'mongoose';

const userHandler = new Hono<HonoEnv>();

/*-----------Create User--------------*/
userHandler.post('/', validateUser, validateAdmin, userPostValidator, async (c) => {
  const payload: IUserPost = c.req.getValid('json');

  const authUserExists = await userService.authUserExists(payload.authUserId);
  if (!authUserExists) {
    throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
  }

  const existingProfile = await userService.findByAuthUserId(payload.authUserId);
  if (existingProfile) {
    throw new ConflictException(ERROR_MESSAGES.USER_ALREADY_EXISTS);
  }

  const createdUser = await userService.create(payload);

  return c.json({ user: createdUser }, StatusCodes.CREATED);
});

/*-----------Get All Users--------------*/
userHandler.get('/', validateUser, validateAdminOrSuperAdmin, userQueryValidator, async (c) => {
  const {
    limit = 10,
    skip = 0,
    search_key,
    sort_by = 'createdAt',
    sort_order,
    hide_deleted,
    ...filterParams
  }: IUserQuery = c.req.getValid('query');

  const filters: FilterQuery<IUserProfile> = {};

  if (search_key) {
    filters.$or = [
      { firstName: { $regex: search_key, $options: 'i' } },
      { lastName: { $regex: search_key, $options: 'i' } },
      { surname: { $regex: search_key, $options: 'i' } },
      { phoneNo: { $regex: search_key, $options: 'i' } }
    ];
  }

  if (filterParams.status) {
    filters.status = filterParams.status;
  } else if (hide_deleted) {
    filters.status = { $ne: USER_ENTITY_STATUS.DELETED };
  }

  if (typeof filterParams.verified !== 'undefined') {
    filters.verified = filterParams.verified;
  }

  if (filterParams.role) {
    const authUserIds = await userService.findAuthUserIdsByRole(filterParams.role);
    if (authUserIds.length === 0) {
      return c.json(
        {
          results: [],
          extras: { total: 0, limit, skip }
        },
        StatusCodes.OK
      );
    }
    filters.authUserId = { $in: authUserIds };
  }

  const users = await userService.searchProfiles(filters, {
    sort_by,
    sort_order,
    limit,
    skip
  });

  return c.json(users, StatusCodes.OK);
});

/*-----------Get All Active Users Count--------------*/
userHandler.get(
  '/count',
  validateUser,
  validateAdminOrSuperAdmin,
  userCountQueryValidator,
  async (c) => {
    const { status }: IUserCountQuery = c.req.getValid('query');
    const usersCount = await userService.countUsers(status);
    return c.json(usersCount, StatusCodes.OK);
  }
);

/*-----------Verify One or Multiple Users at Once--------------*/
userHandler.patch('/verify', validateUser, validateAdmin, usersVerifyValidator, async (c) => {
  const { userIDs, verification }: IUsersVerification = await c.req.getValid('json');

  if (!userIDs || userIDs.length === 0) {
    throw new BadRequestException(ERROR_MESSAGES.BAD_REQUEST);
  }

  const updatedUsers = await userService.updateMany(
    { _id: { $in: userIDs } },
    { $set: { verified: verification } }
  );

  if (!updatedUsers.matchedCount) {
    throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
  }

  const verificationStatus = verification ? 'Verified' : 'Non Verified';

  return c.json(
    {
      message: `Marked ${pkg.capitalize(verificationStatus)} Successfully.`,
      verifiedProfileIDs: userIDs
    },
    StatusCodes.OK
  );
});

/*-----------Update Status for One or Multiple Users at Once--------------*/
userHandler.patch('/status', validateUser, validateAdmin, usersUpdateStatusValidator, async (c) => {
  const { userIDs, status }: IUsersUpdateStatus = await c.req.getValid('json');

  if (!userIDs || userIDs.length === 0) {
    throw new BadRequestException(ERROR_MESSAGES.BAD_REQUEST);
  }

  const updatedUsers = await userService.updateMany(
    { _id: { $in: userIDs } },
    { $set: { status } }
  );

  if (!updatedUsers.matchedCount) {
    throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
  }

  return c.json(
    {
      message: `Marked ${pkg.capitalize(status)} Successfully.`,
      updatedProfileIDs: userIDs
    },
    StatusCodes.OK
  );
});

/*-----------Get Single User by ID--------------*/
userHandler.get('/:id', validateUser, async (c) => {
  const id = c.req.param('id');

  if (!isValidObjectId(id)) {
    throw new BadRequestException(ERROR_MESSAGES.INVALID_OBJECT_ID);
  }

  const user = await userService.findById(id);

  if (!user) {
    throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
  }

  return c.json({ user }, StatusCodes.OK);
});

/*-----------Update User by ID--------------*/
userHandler.patch('/:id', validateUser, userEditValidator, async (c) => {
  const { id } = c.req.param();

  if (!isValidObjectId(id)) {
    throw new BadRequestException(ERROR_MESSAGES.INVALID_OBJECT_ID);
  }

  const payload: IUserEdit = c.req.getValid('json');

  if (!payload || Object.keys(payload).length === 0) {
    throw new BadRequestException(ERROR_MESSAGES.BAD_REQUEST);
  }

  const userProfile = await userService.findById(id);

  if (!userProfile) {
    throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
  }

  const authUser = c.get('user');
  const isProfileOwner = userProfile.authUserId === authUser.id;
  const isAdmin =
    authUser.role === SYSTEM_ROLE.ADMIN || authUser.role === SYSTEM_ROLE.SUPER_ADMIN;

  if (!isProfileOwner && !isAdmin) {
    throw new UnauthorizedException(ERROR_MESSAGES.UNAUTHORIZED);
  }

  const updatedUser = await userService.updateById(id, { $set: payload });

  return c.json({ user: updatedUser }, StatusCodes.OK);
});

/*-----------Update Protected Fields by Admin --------------*/
userHandler.patch('/:id/protected', validateUser, validateAdmin, userProtectedValidator, async (c) => {
  const { id } = c.req.param();

  if (!isValidObjectId(id)) {
    throw new BadRequestException(ERROR_MESSAGES.INVALID_OBJECT_ID);
  }

  const payload: IUserProtected = c.req.getValid('json');
  const userProfile = await userService.findById(id);

  if (!userProfile) {
    throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
  }

  const updatedRole = await userService.updateAuthUserRole(userProfile.authUserId, payload.role);

  if (!updatedRole) {
    throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
  }

  return c.json(
    {
      message: 'User updated successfully',
      userId: id
    },
    StatusCodes.OK
  );
});

/*-----------Update User Password--------------*/
userHandler.patch('/:id/password', validateUser, userPasswordValidator, async (c) => {
  const { id } = c.req.param();

  if (!isValidObjectId(id)) {
    throw new BadRequestException(ERROR_MESSAGES.INVALID_OBJECT_ID);
  }

  const userProfile = await userService.findById(id);

  if (!userProfile) {
    throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
  }

  const authUser = c.get('user');
  const isProfileOwner = userProfile.authUserId === authUser.id;

  if (!isProfileOwner) {
    throw new UnauthorizedException(ERROR_MESSAGES.UNAUTHORIZED);
  }

  const payload: IUserPassword = c.req.getValid('json');

  const response = await auth.api.changePassword({
    headers: c.req.raw.headers,
    body: payload,
    asResponse: true
  });

  return response;
});

/*-----------Delete User by ID--------------*/
userHandler.delete('/:id', validateUser, async (c) => {
  const { id } = c.req.param();

  if (!isValidObjectId(id)) {
    throw new BadRequestException(ERROR_MESSAGES.INVALID_OBJECT_ID);
  }

  const user = c.get('user');
  const foundUser = await userService.findById(id);

  if (!foundUser) {
    throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
  }

  const isProfileOwner = foundUser.authUserId === user.id;
  const isAdmin = user.role === SYSTEM_ROLE.ADMIN || user.role === SYSTEM_ROLE.SUPER_ADMIN;

  if (!isProfileOwner && !isAdmin) {
    throw new UnauthorizedException(ERROR_MESSAGES.UNAUTHORIZED);
  }

  await userService.updateById(id, {
    $set: { status: USER_ENTITY_STATUS.DELETED }
  });

  return c.json('Deleted the Profile Successfully', StatusCodes.OK);
});

export default userHandler;
