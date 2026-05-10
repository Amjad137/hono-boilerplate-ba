import { StatusCodes } from 'http-status-codes';

import { ERROR_MESSAGES } from '@/constants/error.constants';
import { HTTPException } from 'hono/http-exception';
import { ErrorHandler } from 'hono/types';
import { HonoEnv } from '@/types/hono.type';

export const globalErrorHandler: ErrorHandler<HonoEnv> = (error, c) => {
  console.error('Error:', error.message);

  if (error instanceof HTTPException) {
    return c.json(
      {
        message: error.message
      },
      error.status
    );
  }
  c.status(StatusCodes.INTERNAL_SERVER_ERROR);
  return c.json({
    message: error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERR
  });
};
