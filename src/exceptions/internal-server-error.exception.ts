import { ERROR_MESSAGES } from '@/constants/error.constants';
import ApplicationException from '@/exceptions/application.exception';
import { StatusCodes } from 'http-status-codes';

export default class InternalServerErrorException extends ApplicationException {
  constructor(message = ERROR_MESSAGES.INTERNAL_SERVER_ERR) {
    super(message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}
