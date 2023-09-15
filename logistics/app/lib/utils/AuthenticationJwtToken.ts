import mergedEnvironmentConfig from '../../config/env.config';
import { JsonWebToken, Token } from '../authentication/index';

interface IRole {
  name: string;
  _id: string;
}
interface IUser {
  id?: string;
  role?: IRole;
}

interface ITokenPayload {
  userId?: string;
  user: IUser;
  lastLoginAt?: number;
}

/**
 * Sign Jwt Token
 */
class AuthenticationJwtToken {
  /**
   * Send authentication JWT token
   */
  static async getToken(
    tokenPayload: ITokenPayload,
    tokenExpiry?: number | null,
    tokenSecret?: string | null,
  ): Promise<string> {
    try {
      // set configured options if not provided
      // const authConfig = config.get('auth');
      tokenPayload = tokenPayload || {};
      tokenExpiry = tokenExpiry || 1800;
      //   tokenSecret = tokenSecret || mergedEnvironmentConfig.jwtSecret
      tokenSecret = tokenSecret || (mergedEnvironmentConfig.default.jwtSecret as string);

      const token: any = new Token(tokenPayload, tokenExpiry);
      const jwt = new JsonWebToken({ secret: tokenSecret });
      const signedToken = await jwt.sign(token);
      return signedToken;
    } catch (err) {
      throw err;
    }
  }
}

export default AuthenticationJwtToken;
