import ERRORS from './errors';

class ConflictError extends Error {
  status: number;
  constructor(message = ERRORS.CONFLICT_ERROR.message) {
    super(message);
    this.name = ERRORS.CONFLICT_ERROR.name;
    this.status = ERRORS.CONFLICT_ERROR.status;
  }
}

export default ConflictError;
