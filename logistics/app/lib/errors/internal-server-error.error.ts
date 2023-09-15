import ERRORS from './errors';

class InternalServerError extends Error {
  status: number;
  constructor(message = ERRORS.INTERNAL_SERVER_ERROR.message) {
    super(message);
    this.name = ERRORS.INTERNAL_SERVER_ERROR.name;
    this.status = ERRORS.INTERNAL_SERVER_ERROR.status;
  }
}

export default InternalServerError;
