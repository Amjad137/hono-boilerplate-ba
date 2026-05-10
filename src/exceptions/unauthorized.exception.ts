import { ERROR_MESSAGES } from '@/constants/error.constants';
import ApplicationException from '@/exceptions/application.exception';
import { StatusCodes } from 'http-status-codes';

export default class UnauthorizedException extends ApplicationException {
  constructor(message = ERROR_MESSAGES.UNAUTHORIZED) {
    super(message, StatusCodes.UNAUTHORIZED);
  }
}
