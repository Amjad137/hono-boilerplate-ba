import { USER_ENTITY_STATUS } from '@/constants/db.constants';
import { ERROR_MESSAGES } from '@/constants/error.constants';
import { SYSTEM_ROLE } from '@/constants/user.constants';
import BadRequestException from '@/exceptions/bad-request.exception';
import NotFoundException from '@/exceptions/not-found.exception';
import UnauthorizedException from '@/exceptions/unauthorized.exception';
import { validateAdminOrSuperAdmin, validateUser } from '@/middlewares/auth.middlewares';
import userService from '@/services/user.service';
import { HonoEnv } from '@/types/hono.type';
import {
  IUserCountQuery,
  IUserEdit,
  userCountQueryValidator,
  userEditValidator,
  userQueryValidator
} from '@/validators/user.validator';
import { Hono } from 'hono';
import { StatusCodes } from 'http-status-codes';

const userHandler = new Hono<HonoEnv>();

/*-----------Get All Users--------------*/
userHandler.get('/', validateUser, validateAdminOrSuperAdmin, userQueryValidator, async (c) => {
  const query = c.req.getValid('query');

  const users = await userService.getAllUsers(query);

  return c.json(users, StatusCodes.OK);
});

/*-----------Get All Active Users Count--------------*/
userHandler.get(
  '/count',
  validateUser,
  validateAdminOrSuperAdmin,
  userCountQueryValidator,
  async (c) => {
    const { banned }: IUserCountQuery = c.req.getValid('query');
    const usersCount = await userService.countUsers(banned);
    return c.json(usersCount, StatusCodes.OK);
  }
);

/*-----------Get Single User by ID--------------*/
userHandler.get('/:id', validateUser, async (c) => {
  const id = c.req.param('id');

  const user = await userService.findUserById(id);

  return c.json({ user }, StatusCodes.OK);
});

/*-----------Update User by ID--------------*/
userHandler.patch('/:id', validateUser, userEditValidator, async (c) => {
  const { id } = c.req.param();

  const payload: IUserEdit = c.req.getValid('json');

  if (!payload || Object.keys(payload).length === 0) {
    throw new BadRequestException(ERROR_MESSAGES.BAD_REQUEST);
  }

  const userProfile = await userService.findUserById(id);

  if (!userProfile) {
    throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
  }

  const authUser = c.get('user');
  const isProfileOwner = userProfile.id === authUser.id;
  const isAdmin = authUser.role === SYSTEM_ROLE.ADMIN || authUser.role === SYSTEM_ROLE.SUPER_ADMIN;

  if (!isProfileOwner && !isAdmin) {
    throw new UnauthorizedException(ERROR_MESSAGES.UNAUTHORIZED);
  }

  const updatedUser = await userService.updateUserById(id, { $set: payload });

  return c.json({ user: updatedUser }, StatusCodes.OK);
});

/*-----------Delete User by ID--------------*/
userHandler.delete('/:id', validateUser, async (c) => {
  const { id } = c.req.param();

  const user = c.get('user');
  const foundUser = await userService.findUserById(id);

  if (!foundUser) {
    throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
  }

  const isProfileOwner = foundUser.id === user.id;
  const isAdmin = user.role === SYSTEM_ROLE.ADMIN || user.role === SYSTEM_ROLE.SUPER_ADMIN;

  if (!isProfileOwner && !isAdmin) {
    throw new UnauthorizedException(ERROR_MESSAGES.UNAUTHORIZED);
  }

  await userService.updateUserById(id, {
    $set: { status: USER_ENTITY_STATUS.DELETED }
  });

  return c.json('Deleted the Profile Successfully', StatusCodes.OK);
});

export default userHandler;
