import { Request, Response, NextFunction } from 'express';
import { UnauthenticatedError } from '../errors';
import MESSAGES from '../utils/messages';
import { JsonWebToken } from '../authentication';
import User from '../../modules/main/models/user.model';
import AuthenticationJwtToken from '../utils/AuthenticationJwtToken';

interface CustomRequest extends Request {
  user?: any;
}
interface IRole {
  name: string;
  _id: string;
}
interface ICurrentUser {
  _id: string;
  name: string;
  mobile: string;
  email: string;
  role: IRole;
  enabled: number;
  isAgentDetialsUpdated?: boolean;
  password?: string;
  activeToken?: string;
}

const authentication = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.headers.authorization) {
      next(new UnauthenticatedError(MESSAGES.LOGIN_ERROR_USER_ACCESS_TOKEN_INVALID));
    }

    const decoded = await JsonWebToken.verifyToken(req.headers.authorization as string);
    req.user = decoded;
    const currentTime = Math.floor(Date.now() / 1000);
    const tokenExpirationTime = decoded.exp;
    const tokenValidFor = tokenExpirationTime - currentTime;
    const currentUser: ICurrentUser | null = await User.findOne({ _id: req.user.user.id });
    if (currentUser?.activeToken !== req.headers.authorization) {
      next(new UnauthenticatedError(MESSAGES.CONCURRENT_SESSION_TERMINATE));
    }
    if (tokenValidFor <= 60 * 10) {
      // 600 seconds = 10 minutes
      // Generate a new token as a refresh token
      const tokenPayload = {
        user: decoded.user,
        lastLoginAt: decoded.lastLoginAt,
      };
      const newRefreshToken = await AuthenticationJwtToken.getToken(tokenPayload);
      await User.findByIdAndUpdate(
        { _id: req.user.user.id },
        {
          $set: { activeToken: newRefreshToken },
        },
      );
      // Send the new refresh token in the response
      res.setHeader('Authorization', `${newRefreshToken}`);
    }

    next();
  } catch (err) {
    next(new UnauthenticatedError(MESSAGES.LOGIN_ERROR_USER_ACCESS_TOKEN_INVALID));
  }
};

export default authentication;
