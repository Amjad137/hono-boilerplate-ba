import { StatusCodes } from 'http-status-codes';

import { ERROR_MESSAGES } from '../constants/error.constants';
import ApplicationException from './application.exception';

export default class ForbiddenException extends ApplicationException {
  constructor(message = ERROR_MESSAGES.FORBIDDEN) {
    super(message, StatusCodes.FORBIDDEN);
  }
}
