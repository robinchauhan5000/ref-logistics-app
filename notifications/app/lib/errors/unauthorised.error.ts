import ERRORS from './errors';

class UnauthorisedError extends Error {
  status: number;
  constructor(message = ERRORS.UNAUTHORISED_ERROR.message) {
    super(message);
    this.name = ERRORS.UNAUTHORISED_ERROR.name;
    this.status = ERRORS.UNAUTHORISED_ERROR.status;
  }
}

export default UnauthorisedError;
