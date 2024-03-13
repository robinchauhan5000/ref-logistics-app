import InternalServerError from '../../../../lib/errors/internal-server-error.error';

import Notification from '../../models/notifications.model';
import MESSAGES from '../../../../lib/utils/messages';
import Agent from '../../models/agent.model';
import Task from '../../models/task.model';

class NotificationService {
  async create(data: any) {
    try {
      const notificationData = new Notification(data);
      const savedNotification = await notificationData.save();
      if (savedNotification) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getUserNotifications(userInfo: any, userId: string) {
    try {
      const agentData: any = await Agent.findOne({ userId });
      const task: any = await Task.findOne({ assignee: agentData?._id });
      if (!task) {
        return [];
      }

      const query = userInfo?.role?.name !== 'Agent' ? {} : { typeId: task?._id };
      const NotificationList = await Notification.find(query).sort({ createdAt: -1 });
      if (NotificationList) {
        return NotificationList;
      } else {
        return [];
      }
    } catch (error) {
      throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }
}

export default NotificationService;
