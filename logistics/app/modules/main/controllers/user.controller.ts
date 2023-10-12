import AgentService from '../v1/services/agent.service';
import UserService from '../v1/services/user.service';
import { NextFunction, Request, Response } from 'express';
import ApplicationSettingService from '../v1/services/applicationSetting.service';
import logger from '../../../lib/logger';

interface CustomRequest extends Request {
  user?: any;
}
const applicationSettignService = new ApplicationSettingService();
const userService = new UserService();
const agentService = new AgentService();

class UserController {
  /**
   * Create a new user
   * @param {*} req    HTTP request object
   * @param {*} res    HTTP response object
   * @param {*} next   Callback argument to the middleware function
   * @return {callback}
   */
  // async create(req, res, next) {
  //   try {
  //     console.log('user data------------------', req.body)
  //     const data = req.body
  //     const user = await userService.create(data)
  //     return res.send(user)
  //   } catch (error) {
  //     console.log('[userController] [createUser] Error -', error)
  //     next(error)
  //   }
  // }

  async invite(req: CustomRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const data = req.body.admins;
      const userId = req.user.user.id;
      const user = await userService.invite(data, userId);
      if (user) {
        return res.send({ message: 'Invitation email send successfully.' });
      }
      // return res.send(user)
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async inviteAgent(req: CustomRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const data = req.body;
      const user = await userService.inviteAgent(data);
      if (user) {
        return res.send({ message: 'Invitation email send to the agent.' });
      }
      // return res.send(data);
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async getProfile(req: CustomRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const data = req.user;
      const user = await userService.getProfile(data.user.id);
      if (user?.role?.name === 'Agent') {
        const isAgentDetailsUpdated = await agentService.isAgentDetailsUpdated(user._id);
        user.isAgentDetailsUpdated = isAgentDetailsUpdated?.isDetailsUpdated;
        user.agentId = isAgentDetailsUpdated?._id;
        res.status(200).json({
          data: {
            user: {
              ...user,
              supportDetails: [],
            },
          },
        });
      } else if (user?.role?.name === 'Super Admin') {
        const supportDetails = await applicationSettignService.getSupport();
        console.log('support Details', supportDetails);
        res.status(200).json({
          data: {
            user: {
              ...user,
              supportDetails: supportDetails,
            },
          },
        });
      } else if (user?.role?.name === 'Admin') {
        const supportDetails = await applicationSettignService.getSupport();
        res.status(200).json({
          data: {
            user: {
              ...user,
              supportDetails: supportDetails,
            },
          },
        });
      }
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async getDashoardData(req: CustomRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const user = req.user.user.id;
      const { skip, limit }: { skip?: number; limit?: number } = req.query;
      const parsedSkip: number = skip || 0;
      const parsedLimit: number = limit || 10;

      const admins = await userService.getDashboardData(user, parsedSkip, parsedLimit);
      res.send({ admins });
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async listUsers(req: CustomRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const user = req.user.user.id;
      const { skip, limit }: { skip?: number; limit?: number } = req.query;
      const parsedSkip: number = skip || 0;
      const parsedLimit: number = limit || 10;
      const usersList = await userService.getUserslist(user, parsedSkip, parsedLimit);
      res.send(usersList);
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async listDrivers(req: CustomRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const user = req.user.user.id;
      const { skip, limit, search }: { skip?: string; limit?: string; search?: string } = req.query;
      const parsedSearch: string = search || '';
      const { driverList, driverCount } = await userService.getDriverslist(user, skip, limit, parsedSearch);
      res.status(200).send({
        msg: 'Drivers fetched successfully',
        data: {
          drivers: driverList,
          count: driverCount,
        },
      });
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }
  async listAdmins(req: CustomRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const user = req.user.user.id;
      const { skip, limit, search }: { skip?: number; limit?: number; search?: string } = req.query;
      const parsedSkip: number = skip || 0;
      const parsedLimit: number = limit || 10;
      const parsedSearch: string = search || '';
      const { admins, adminCount } = await userService.getAdminsList(user, parsedSkip, parsedLimit, parsedSearch);
      res.status(200).send({
        msg: 'Admins fetched successfully',
        data: {
          admins,
          count: adminCount,
        },
      });
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async userSettings(req: CustomRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user.user.id;
      const data = req.body;
      const response = await userService.userSettings({ ...data, userId });
      if (response) {
        res.json({ message: 'Settings saved successfully', data: response });
      }
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async updateProfile(req: CustomRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user.user.id;
      const data = req.body;
      await userService.updateProfile(userId, data);
      res.status(200).json({ message: 'Personal details updated successfully' });
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async alter(req: CustomRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user.user.id;
      const { adminId, enabled } = req.body;
      await userService.alterAdmin(userId, adminId, enabled);
      res.status(200).json({ message: 'Admin updated successfully' });
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  /**
   * Update user
   * @param {*} req    HTTP request object
   * @param {*} res    HTTP response object
   * @param {*} next   Callback argument to the middleware function
   * @return {callback}
   */
  // async update(req, res, next) {
  //     const data = req.body;
  //     try {
  //         const user = await userService.addFields(data, req.user);
  //         res.send(user);
  //     } catch (err) {
  //         next(err);
  //     }
  // }

  /**
   * Get single user by id
   * @param {*} req    HTTP request object
   * @param {*} res    HTTP response object
   * @param {*} next   Callback argument to the middleware function
   * @return {callback}
   */
  // async getUser(req, res, next) {
  //     try {
  //         const currentUser=req.user;

  //         console.log('currentUser-------------->',currentUser);
  //         const user = await userService.get(req.params.userId,currentUser);
  //         return res.send(user);

  //     } catch (error) {
  //         console.log('[userController] [getUser] Error -', error);
  //         next(error);
  //     }
  // }

  /**
   * Get list of all users
   * @param {*} req    HTTP request object
   * @param {*} res    HTTP response object
   * @param {*} next   Callback argument to the middleware function
   * @return {callback}
   */
  // async getUsers(req, res, next) {
  //     try {
  //         const params = req.params;
  //         const query = req.query;
  //         query.offset = parseInt(query.offset??0);
  //         query.limit = parseInt(query.limit??100);
  //         const user = await userService.list(params.organizationId,query);
  //         return res.send(user);

  //     } catch (error) {
  //         console.log('[userController] [getUsers] Error -', error);
  //         next(error);
  //     }
  // }
  // async getUsersById(req, res, next) {
  //     try {
  //         const data = req.body;
  //         const user = await userService.usersById(req.params.userId);
  //         return res.send(user);

  //     } catch (error) {
  //         console.log('[userController] [getUsers] Error -', error);
  //         next(error);
  //     }
  // }

  // async enable(req, res, next) {
  //     try {
  //         const data = req.body;
  //         const user = await userService.enable(req.params.userId,data);
  //         return res.send(user);

  //     } catch (error) {
  //         console.log('[userController] [getUsers] Error -', error);
  //         next(error);
  //     }
  // }

  // async upload(req, res, next) {
  //     try {
  //         const currentUser=req.user;
  //         const result = await userService.upload(
  //             currentUser,
  //             `${req.params.category}`,
  //             req.body
  //         );
  //         res.json(result);
  //     } catch (e) {
  //         next(e);
  //     }
  // }
}

export default UserController;
