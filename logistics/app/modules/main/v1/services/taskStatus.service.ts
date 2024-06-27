import InternalServerError from '../../../../lib/errors/internal-server-error.error';
import {
  // DuplicateRecordFoundError,
  NoRecordFoundError,
} from '../../../../lib/errors/index';
import TaskStatus from '../../models/taskStatus.model';
import MESSAGES from '../../../../lib/utils/messages';
import { LinkExpired } from '../../../../lib/errors/index';
class TaskStatusService {
  async create(data: any): Promise<any> {
    try {
      // const getTaskStatus = await TaskStatus.findOne({ taskId: data.taskId, status: data.status }).lean();
      // if (getTaskStatus) {
      //   return true;
      // }
      const taskStatus = new TaskStatus(data);
      const savedObj = await taskStatus.save();
      if (savedObj) {
        return true;
      }
    } catch (error: any) {
      console.log({error})
      if (error.status === 409) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async getTastStatus(search = {}){
    try {
      const taskStatus = await TaskStatus.findOne(search);

      return taskStatus;
    } catch (error: any) {
      if (error.status === 404 || error.status === 401) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async taskStatusByTaskId(taskId: string) {
    try {
      const taskStatusList = await TaskStatus.find({ taskId }).sort({ createdAt: 1 });
      if (taskStatusList.length === 0) {
        throw new NoRecordFoundError(MESSAGES.TASK_NOT_EXIST);
      }

      return taskStatusList;
    } catch (error: any) {
      if (error.status === 404 || error.status === 401) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }

    async taskStatusByTaskIdAndStatus(taskId: string, status:string) {
    try {
      const taskStatusList = await TaskStatus.findOne({ taskId, status }).sort({ createdAt: 1 });
      return taskStatusList;
    } catch (error: any) {
      if (error.status === 404 || error.status === 401) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async getTaskStatusById(taskId: string): Promise<any> {
    try {
      const currentDateInMilliseconds = new Date().getTime();
      const taskStatus: any = await TaskStatus.find({ taskId });
      const latestTaskStatus = taskStatus[taskStatus.length - 1];
      if (taskStatus.length && latestTaskStatus.status === 'Order-delivered') {
        const taskCreatedAt = new Date(latestTaskStatus.createdAt);
        const createdAtInMilliseconds = taskCreatedAt.getTime();
        const difference = Math.abs(currentDateInMilliseconds - createdAtInMilliseconds);
        if (difference > 24 * 60 * 60 * 1000) {
          throw new LinkExpired(MESSAGES.LINK_EXPIRED);
        } else return taskStatus;
      }

      return taskStatus;
    } catch (error: any) {
      throw error;
    }
  }
}

export default TaskStatusService;
