import { ERROR_MESSAGES } from '@/constants/error.constants';
import ApplicationException from '@/exceptions/application.exception';
import { StatusCodes } from 'http-status-codes';

export default class TooManyRequestsException extends ApplicationException {
  constructor(message = ERROR_MESSAGES.TOO_MANY_REQUESTS) {
    super(message, StatusCodes.TOO_MANY_REQUESTS);
  }
}
