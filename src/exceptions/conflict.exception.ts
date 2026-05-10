import { ERROR_MESSAGES } from '@/constants/error.constants';
import ApplicationException from '@/exceptions/application.exception';
import { StatusCodes } from 'http-status-codes';

export default class ConflictException extends ApplicationException {
  constructor(message = ERROR_MESSAGES.CONFLICT) {
    super(message, StatusCodes.CONFLICT);
  }
}
