import { Request, Response, NextFunction } from 'express';
import { UnauthenticatedError } from '../errors';
import MESSAGES from '../utils/messages';
import { JsonWebToken } from '../authentication';

interface CustomRequest extends Request {
  user?: any;
}

const authentication = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    console.log(`res: ${res.status}`);
    if (!req.headers.authorization) {
      new UnauthenticatedError(MESSAGES.LOGIN_ERROR_USER_ACCESS_TOKEN_INVALID);
    }

    const decoded = await JsonWebToken.verifyToken(req.headers.authorization as string);
    req.user = decoded;
    next();
  } catch (err) {
    next(new UnauthenticatedError(MESSAGES.LOGIN_ERROR_USER_ACCESS_TOKEN_INVALID));
  }
};

export default authentication;
