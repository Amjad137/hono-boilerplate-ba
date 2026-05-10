import { ERROR_MESSAGES } from '@/constants/error.constants';
import ApplicationException from '@/exceptions/application.exception';
import { StatusCodes } from 'http-status-codes';

export default class BadRequestException extends ApplicationException {
  constructor(message = ERROR_MESSAGES.BAD_REQUEST) {
    super(message, StatusCodes.BAD_REQUEST);
  }
}
