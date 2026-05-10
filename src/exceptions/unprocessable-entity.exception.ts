import { ERROR_MESSAGES } from '@/constants/error.constants';
import ApplicationException from '@/exceptions/application.exception';
import { StatusCodes } from 'http-status-codes';

export default class UnprocessableEntityException extends ApplicationException {
  constructor(message = ERROR_MESSAGES.UNPROCESSABLE_ENTITY) {
    super(message, StatusCodes.UNPROCESSABLE_ENTITY);
  }
}
