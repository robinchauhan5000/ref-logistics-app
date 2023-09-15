import jwt, { Secret } from 'jsonwebtoken';
import mergedEnvironmentConfig from '../../config/env.config';

class JsonWebToken {
  private options: { secret: Secret };

  /**
   *
   * @param {*} options JWT options
   */
  constructor(options: { secret: Secret }) {
    this.options = options;
  }

  /**
   * Sign JWT token
   * @param {*} token Instance of Token class
   */
  sign(token: { payload: any; exp: number }): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      jwt.sign(token.payload, this.options.secret, { expiresIn: token.exp }, (err, token) => {
        if (err) {
          reject(err);
        } else {
          resolve(token as string);
        }
      });
    });
  }

  /**
   * Verify JWT token
   * @param {} jwtToken JWT token in String format
   */
  verify(jwtToken: string): Promise<any | string> {
    return new Promise<any | string>((resolve, reject) => {
      jwt.verify(jwtToken, this.options.secret, (err: any, decoded: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      });
    });
  }

  static async verifyToken(jwtToken: string): Promise<any | string> {
    return new Promise<any | string>((resolve, reject) => {
      jwt.verify(jwtToken, mergedEnvironmentConfig.default.jwtSecret, (err: any, decoded: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      });
    });
  }
}

export default JsonWebToken;
