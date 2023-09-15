import logger from '../../../lib/logger';
import { NextFunction, Request, Response } from 'express';
import NotificationService from '../v1/services/notifications.service';
// import Agent from '../models/agent.model';
// import Role from '../models/role.model';
import User from '../models/user.model';

const notificationService = new NotificationService();

interface CustomRequest extends Request {
  user?: any;
}
class NotificationController {
  async userNotifications(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user.user.id;
      const user: any = await User.findById(userId).populate({ path: 'role', select: 'name' });
      const notificationList = await notificationService.getUserNotifications(user, userId);

      res.status(200).send({
        message: 'Notification list found.',
        data: notificationList,
      });
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }
}

export default NotificationController;
