import environment from '@/config/env.config';
import { ERROR_MESSAGES } from '@/constants/error.constants';
import { HTTPException } from 'hono/http-exception';
import { StatusCodes } from 'http-status-codes';

export default class ApplicationException extends HTTPException {
  statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

  constructor(message: string, status: number) {
    super(status as HTTPException['status'], { message });

    this.name = this.constructor.name;
    this.message = message ?? ERROR_MESSAGES.INTERNAL_SERVER_ERR;
    this.statusCode = status;

    if (environment.isDebugMode) {
      console.error(this);
    }
  }
}
