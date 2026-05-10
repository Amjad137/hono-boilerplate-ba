import { auth } from '@/config/better-auth';
import { ERROR_MESSAGES } from '@/constants/error.constants';
import { SYSTEM_ROLE } from '@/constants/user.constants';
import ForbiddenException from '@/exceptions/forbidden.exception';
import UnauthorizedException from '@/exceptions/unauthorized.exception';
import { createMiddleware } from 'hono/factory';

export const validateUser = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers
  });

  if (!session?.user || !session?.session) {
    throw new UnauthorizedException(ERROR_MESSAGES.UNAUTHORIZED);
  }

  c.set('user', session.user);
  c.set('session', session.session);

  await next();
});

export const validateAdmin = createMiddleware(async (c, next) => {
  const user = c.get('user');

  if (!user || user.role !== SYSTEM_ROLE.ADMIN) {
    throw new ForbiddenException(ERROR_MESSAGES.ADMIN_ONLY_ACTION);
  }

  await next();
});

export const validateSuperAdmin = createMiddleware(async (c, next) => {
  const user = c.get('user');

  if (!user || user.role !== SYSTEM_ROLE.SUPER_ADMIN) {
    throw new ForbiddenException(ERROR_MESSAGES.SUPER_ADMIN_ONLY_ACTION);
  }

  await next();
});

export const validateAdminOrSuperAdmin = createMiddleware(async (c, next) => {
  const user = c.get('user');

  if (!user || (user.role !== SYSTEM_ROLE.ADMIN && user.role !== SYSTEM_ROLE.SUPER_ADMIN)) {
    throw new ForbiddenException(ERROR_MESSAGES.ADMIN_ONLY_ACTION);
  }

  await next();
});
