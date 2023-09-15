import ERRORS from './errors';

class LinkExpired extends Error {
  status: number;
  constructor(message = ERRORS.LINK_EXPIRED.message) {
    super(message);
    this.name = ERRORS.LINK_EXPIRED.name;
    this.status = ERRORS.LINK_EXPIRED.status;
  }
}

export default LinkExpired;
