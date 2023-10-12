import AuthenticationService from '../v1/services/authentication.service';
import AgentService from '../v1/services/agent.service';
import { JsonWebToken } from '../../../lib/authentication';
// import { HEADERS } from '../../../lib/utils/constants'
// import HttpRequest from '../../../lib/utils/HttpRequest'
// import { mergedEnvironmentConfig } from '../../../config/env.config'
// import axios from 'axios'
// import UserService from '../v1/services/user.service'

import { NextFunction, Request, Response } from 'express';
import mergedEnvironmentConfig from '../../../config/environments/base/index';
import axios from 'axios';
import logger from '../../../lib/logger';
interface CustomRequest extends Request {
  user?: any;
}

const authenticationService = new AuthenticationService();
const agentService = new AgentService();
// const userService = new UserService()
class AuthenticationController {
  /**
   * Login
   * @param {*} req    HTTP request object
   * @param {*} res    HTTP response object
   * @param {*} next   Callback argument to the middleware function
   * @return {callback}
   **/
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body;
      const user = await authenticationService.login(data);
      if (user.currentUser.role?.name === 'Agent') {
        const isAgentDetailsUpdated = await agentService.isAgentDetailsUpdated(user.currentUser._id);
        user.currentUser.isAgentDetailsUpdated = isAgentDetailsUpdated?.isDetailsUpdated;
      }

      res.json({ data: user, redirect: true });
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async loginviaMobile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body;
      const user = await authenticationService.loginviaMobile(data);
      res.json({ data: user, redirect: true });
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async googleLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body;
      const user = await authenticationService.googleLogin(data);
      if (user.currentUser.role?.name === 'Agent') {
        const isAgentDetailsUpdated = await agentService.isAgentDetailsUpdated(user.currentUser._id);
        user.currentUser.isAgentDetailsUpdated = isAgentDetailsUpdated?.isDetailsUpdated;
      }

      res.json({ data: user });
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async createPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body;
      const passwordCreated = await authenticationService.createPassword(data);
      if (passwordCreated) {
        res.json({ message: 'Password updated.', redirect: true });
      }
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async changePassword(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body;
      const passwordCreated = await authenticationService.changePassword(data, req.user.user.id);
      if (passwordCreated) {
        res.json({ message: 'Password has been successfully changed.', redirect: true });
      }
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async verifyInviteLink(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId;
      const linkVerified = await authenticationService.verifyInviteLink(userId);
      if (linkVerified) {
        res.json({ message: 'Link verified.' });
      }
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async logout(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user.user.id;
      const isTokenDeleted = await authenticationService.logout(userId);
      if (isTokenDeleted) {
        res.json({ message: 'You are logout.' });
      }
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  //   /**
  //    * Forgot Password
  //    * @param {*} req    HTTP request object
  //    * @param {*} res    HTTP response object
  //    * @param {*} next   Callback argument to the middleware function
  //    * @return {callback}
  //    **/
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      const emailSent = await authenticationService.forgotPassword(email);
      if (emailSent) {
        res.json({ message: 'Password reset link sent on email.', redirect: true });
      }
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  //   /**
  //    * Forgot Password
  //    * @param {*} req    HTTP request object
  //    * @param {*} res    HTTP response object
  //    * @param {*} next   Callback argument to the middleware function
  //    * @return {callback}
  //    **/
  //   updatePassword(req, res, next) {
  //     const data = req.body
  //     authenticationService
  //       .updatePassword(data)
  //       .then((result) => {
  //         res.json({ data: result })
  //       })
  //       .catch((err) => {
  //         next(err)
  //       })
  //   }

  //   /**
  //    * Reset Password
  //    *
  //    * Used when the user logs in with the OTP
  //    *
  //    * @param {*} req    HTTP request object
  //    * @param {*} res    HTTP response object
  //    * @param {*} next   Callback argument to the middleware function
  //    * @return {callback}
  //    **/

  async resetPassword(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const { password, token } = req.body;
      const tokenViaQuery = req.query.token as string;
      console.log(token || tokenViaQuery);
      const decodedToken = await JsonWebToken.verifyToken(token || tokenViaQuery);
      console.log({ decodedToken });

      const result = await authenticationService.resetPassword(password, token, decodedToken?.user?.id);
      if (result) {
        res.json({ msg: 'Password Updated Successfully', redirect: true });
      }
    } catch (err: any) {
      if (err.message === 'jwt expired')
        res.status(401).json({ msg: 'Your Link for the password reset is expired', redirect: false });
      else if (err.message == 'invalid signature')
        res.status(401).json({ msg: 'The Token provided is not valid', redirect: false });
      logger.error(`${req.method} ${req.originalUrl} error: ${err.message}`);
      next(err);
    }
  }

  async mmiToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = {
        grant_type: 'client_credentials',
        client_id: mergedEnvironmentConfig.mmi.id as string,
        client_secret: mergedEnvironmentConfig.mmi.secret as string,
      };

      const paramsData = new URLSearchParams();
      paramsData.append('grant_type', params.grant_type);
      paramsData.append('client_id', params.client_id);
      paramsData.append('client_secret', params.client_secret);
      const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

      const result = await axios.post('https://outpost.mapmyindia.com/api/security/oauth/token', paramsData, {
        headers,
      });

      res.send({ access_token: result.data.access_token });
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  //   /**
  //    * Set Password
  //    *
  //    * Force change password for org admins
  //    * Set password for user themselves
  //    *
  //    * @param {*} req    HTTP request object
  //    * @param {*} res    HTTP response object
  //    * @param {*} next   Callback argument to the middleware function
  //    * @return {callback}
  //    **/
  //   setPassword(req, res, next) {
  //     const data = req.body
  //     const user = req.user
  //     authenticationService
  //       .setPassword(data, user)
  //       .then((result) => {
  //         res.json({ data: result })
  //       })
  //       .catch((err) => {
  //         next(err)
  //       })
  //   }

  //   grantAccess(req, res) {
  //     let { id: userId } = req.params
  //     userService
  //       .grantAccess(userId)
  //       .then((token) => {
  //         res.json({})
  //       })
  //       .catch((err) => {
  //         next(err)
  //       })
  //   }

  async checkContactNumber(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const contactNumber = req.body.mobile;
      const contactExist = await authenticationService.checkContactNumber(contactNumber);
      if (contactExist) {
        res.json({ exist: true });
      }
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }
}

export default AuthenticationController;
