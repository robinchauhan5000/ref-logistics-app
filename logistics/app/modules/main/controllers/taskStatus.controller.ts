import { NextFunction, Request, Response } from 'express';
import TaskStatusService from '../v1/services/taskStatus.service';
import TaskService from '../v1/services/task.service';
import NotificationService from '../v1/services/notifications.service';
import logger from '../../../lib/logger';
import Task from '../models/task.model';
import { NoRecordFoundError } from '../../../lib/errors';
import MESSAGES from '../../../lib/utils/messages';
import HttpRequest from '../../../lib/utils/HttpRequest';
import ModifyPayload from '../../../lib/utils/modifyPayload';
// import { removeIdKeys } from '../../../lib/utils/utilityFunctions';

const taskStatusService = new TaskStatusService();
const notificationService = new NotificationService();
const taskService = new TaskService();
const modifyPayload = new ModifyPayload();

const clientURL = process.env.PROTOCOL_BASE_URL || '';
class TaskStatusController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      console.log({taskStatusData: data})
      if (data?.status === 'Customer-not-found') {
        const task: any = await Task.findById(data?.taskId);
        if (!task) {
          throw new NoRecordFoundError(MESSAGES.TASK_NOT_EXIST);
        }
        if (task?.items[0]?.descriptor?.code === "P2H2P" && task.failedDeliveryCount <= 3) {
          console.log("Delivery failed, please reschedule")
          const updatedTask = await taskService.updateStatus(data.taskId, "Delivery-failed");
          console.log({ updatedTask })
        }

        let tags = task?.fulfillments[0]?.tags;
        tags = tags.filter((obj: any) => obj?.code === 'rto_action');
        let updatedTask: any
        
        let taskStatusObject = {
          status: 'RTO-Initiated',
          description: data?.description,
          taskId: data?.taskId,
          link: data?.link,
          agentId: data?.agentId
        };
        if(task.status == 'Agent-assigned') {
          taskStatusObject = {
            status: 'Cancelled',
            description: data?.description,
            taskId: data?.taskId,
            link: data?.link,
            agentId: data?.agentId
          };
          updatedTask = await taskService.updateStatus(data.taskId, data.status, true);
        } else {
          updatedTask = await taskService.updateStatus(data.taskId, data.status);
        }

        console.log("taskStatusObject+++=",updatedTask);

        await taskStatusService.create(taskStatusObject);
        const headers = {};
        const onCancelPayload = await modifyPayload.cancel(updatedTask);
        logger.info(`POST cancel response : ${JSON.stringify(onCancelPayload, null, 2)}`);
        const httpRequest = new HttpRequest(`${clientURL}/protocol/v1/on_cancel`, 'POST', onCancelPayload, headers);
        httpRequest.send();

        res.status(200).send({
          message: 'Your Order is RTO Initiated now.',
        });
      } else {
        // const taskStatusCheck = await taskStatusService.taskStatusByTaskIdAndStatus(data.taskId, "In-transit")

        const updatedTask = await taskService.updateStatus(data.taskId, data.status);
        await taskStatusService.create(data);
        const notificationData = {
          type: 'Task',
          typeId: updatedTask._id,
          status: 'Unread',
          userId: updatedTask.assignedBy,
          text: updatedTask.status,
        };
        await notificationService.create(notificationData);
        const headers = {};
        const onStatusPayload = await modifyPayload.status(updatedTask);
        const httpRequest = new HttpRequest(
          `${clientURL}/protocol/v1/status`, //TODO: allow $like query
          'POST',
          onStatusPayload,
          headers,
        );
        httpRequest.send();
        res.status(200).send({
          message: 'Status updated successfully.',
        });

      }
    } catch (error: any) {
      console.log({ error });
      logger.error(`${req.method} ${req.originalUrl} error: ${error}`);
      next(error);
    }
  }

  async getTaskStatusList(req: Request, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.params;
      const list = await taskStatusService.taskStatusByTaskId(taskId);
      res.status(200).send({
        message: 'Task status list fetched successfully.',
        data: {
          list,
        },
      });
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async getTaskStatusById(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { id } = req.params;

      const taskStatus = await taskStatusService.getTaskStatusById(id);
      const task = await taskService.getOne(id);
      if (taskStatus && task) {
        res.status(200).send({
          message: 'Task fetched successfully',
          data: {
            taskStatus,
            task,
          },
        });
      }
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }
}

export default TaskStatusController;
