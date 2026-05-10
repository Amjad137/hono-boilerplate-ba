import environment from '@/config/env.config';
import { ERROR_MESSAGES } from '@/constants/error.constants';
import NotFoundException from '@/exceptions/not-found.exception';
import { HonoEnv } from '@/types/hono.type';
import { Hono } from 'hono';
import { StatusCodes } from 'http-status-codes';

const rootApp = new Hono<HonoEnv>();

rootApp.get('/health', (c) => {
  c.status(StatusCodes.OK);
  return c.json({
    message: 'Welcome to the Hono API',
    version: environment.packageVersion,
    environment: environment.env
  });
});

rootApp.all('*', (c) => {
  c.status(StatusCodes.NOT_FOUND);
  throw new NotFoundException(ERROR_MESSAGES.ROUTE_NOT_FOUND);
});

export default rootApp;
