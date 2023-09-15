import Task from '../models/task.model';
import TaskService from '../v1/services/task.service';
import { NextFunction, Request, Response } from 'express';
import MESSAGES from '../../../lib/utils/messages';
import { NoRecordFoundError } from '../../../lib/errors/index';
import TaskStatusService from '../v1/services/taskStatus.service';
import NotificationService from '../v1/services/notifications.service';
import AgentService from '../v1/services/agent.service';
import logger from '../../../lib/logger';
import eventEmitter from '../../../lib/utils/eventEmitter';
interface CustomRequest extends Request {
  user?: any;
}

const taskService = new TaskService();
const agentService = new AgentService();
const taskStatusService = new TaskStatusService();
const notificationService = new NotificationService();

const cancellation_terms = [
  {
    fulfillment_state: {
      descriptor: {
        code: 'Pending',
        short_desc: '',
      },
    },
    refund_eligible: true,
    reason_required: false,
    cancellation_fee: {
      amount: {
        currency: 'INR',
        value: '0.0',
      },
    },
  },
  {
    fulfillment_state: {
      descriptor: {
        code: 'Agent-assigned',
        short_desc: '001,003',
      },
    },
    refund_eligible: true,
    reason_required: true,
    cancellation_fee: {
      amount: {
        currency: 'INR',
        value: '50',
      },
    },
  },
  {
    fulfillment_state: {
      descriptor: {
        code: 'Order-picked-up',
        short_desc: '001,003',
      },
    },
    refund_eligible: true,
    reason_required: true,
    cancellation_fee: {
      amount: {
        currency: 'INR',
        value: '100',
      },
    },
  },
  {
    fulfillment_state: {
      descriptor: {
        code: 'Out-for-delivery',
        short_desc: '011,012,013,014,015',
      },
    },
    refund_eligible: true,
    reason_required: true,
    cancellation_fee: {
      amount: {
        currency: 'INR',
        value: '100.0',
      },
    },
  },
];

const tags = [
  {
    code: 'bpp_terms',
    list: [
      {
        code: 'max_liability',
        value: '2',
      },
      {
        code: 'max_liability_cap',
        value: '10000',
      },
      {
        code: 'mandatory_arbitration',
        value: 'false',
      },
      {
        code: 'court_jurisdiction',
        value: 'Bengaluru',
      },
      {
        code: 'delay_interest',
        value: '1000',
      },
      {
        code: 'static_terms',
        value: 'https://github.com/ONDC-Official/protocol-network-extension/discussions/79',
      },
    ],
  },
];

class TaskController {
  async create(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { task, agents }: any = await taskService.create(req.body);
      if (task) {
        eventEmitter.emit('createTask', {
          _id: task?._id,
          status: task?.status,
          task_id: task?.task_id,
          product: task?.product,
        });
      }

      eventEmitter.emit('live_update', { task: 'created' });

      res.json({ message: 'Task created sucessfully', agents });
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async sse(req: Request, res: Response, next: NextFunction) {
    try {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');
      // let datae = true;
      // setInterval(() => {
      //   const event = `event: on_interval\ndata: ${JSON.stringify(!datae)}\n\n`;
      //   console.log({ event });
      //   datae = !datae;
      //   res.write(event);
      // }, 5000);
      const taskEventHandler = (_data: any) => {
        const event = `event: on_live_update\ndata: ${JSON.stringify(Date.now())}\n\n`;
        res.write(event);
      };

      const updateStatusEventHandler = (data: any) => {
        const event = `event: on_status_update\ndata: ${JSON.stringify(data)}\n\n`;
        res.write(event);
      };

      const agentAssignedEventHandler = (data: any) => {
        const event = `event: on_agent_assigned\ndata: ${JSON.stringify(data)}\n\n`;
        res.write(event);
      };

      const toggleIsOfflineEventHandler = (data: any) => {
        const event = `event: on_toggle_offline\ndata: ${JSON.stringify(data)}\n\n`;
        res.write(event);
      };

      const issueEventHandler = (data: any) => {
        const event = `event: on_issue\ndata: ${JSON.stringify(data)}\n\n`;
        res.write(event);
      };
      const driverEventHandler = (data: any) => {
        const event = `event: on_driver\ndata: ${JSON.stringify(data)}\n\n`;
        res.write(event);
      };

      const driverLocationEventHandler = (data: any) => {
        const event = `event: on_location_update\ndata: ${JSON.stringify(data)}\n\n`;
        res.write(event);
      };

      // Listen for custom events and send SSE responses
      eventEmitter.on('live_update', taskEventHandler);
      eventEmitter.on('driver', driverEventHandler);

      eventEmitter.on('statusUpdate', updateStatusEventHandler);
      eventEmitter.on('agentAssigned', agentAssignedEventHandler);
      eventEmitter.on('toggleIsOffline', toggleIsOfflineEventHandler);
      eventEmitter.on('driverLocation', driverLocationEventHandler);

      eventEmitter.on('issue', issueEventHandler);

      // setInterval(() => {
      //   taskEventHandler('data');
      // }, 5000);

      // clean up
      req.on('close', () => {
        eventEmitter.off('live_update', taskEventHandler);
        eventEmitter.off('agentAssigned', agentAssignedEventHandler);
        eventEmitter.off('statusUpdate', updateStatusEventHandler);
        eventEmitter.off('toggleIsOffline', toggleIsOfflineEventHandler);
        eventEmitter.off('issue', issueEventHandler);
        eventEmitter.off('driver', driverEventHandler);
        eventEmitter.off('driverLocation', driverLocationEventHandler);

        res.end();
      });
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async getAssignedTasks(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { skip, limit, search }: { skip?: number; limit?: number; search?: string } = req.query;
      const parsedSkip: number = skip || 0;
      const parsedLimit: number = limit || 10;
      const { tasks, taskCount } = await taskService.assignedTasks(parsedSkip, parsedLimit, search);
      res.status(200).send({
        message: 'Tasks fetched successfully',
        data: {
          tasks,
          taskCount,
        },
      });
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async getUnassignedTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const { skip, limit, search }: { skip?: number; limit?: number; search?: string } = req.query;
      const parsedSkip: number = skip || 0;
      const parsedLimit: number = limit || 10;
      const { tasks, taskCount } = await taskService.unassignedTasks(parsedSkip, parsedLimit, search);
      res.status(200).send({
        message: 'Tasks fetched successfully',
        data: {
          tasks,
          taskCount,
        },
      });
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async getTask(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { id } = req.params;
      const task = await taskService.getOne(id);
      if (task.is_confirmed) {
        const taskStatus = await taskStatusService.taskStatusByTaskId(`${task._id}`);
        res.status(200).send({
          message: 'Task fetched successfully',
          data: {
            task,
            taskStatus,
          },
        });
      } else {
        res.status(200).send({
          message: 'Task fetched successfully',
          data: {
            task,
            taskStatus: [],
          },
        });
      }
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async getIssueTask(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { id } = req.params;
      const task = await taskService.getTaskByTransId(id);
      if (task.is_confirmed) {
        const taskStatus = await taskStatusService.taskStatusByTaskId(`${task._id}`);
        res.status(200).send({
          message: 'Task fetched successfully',
          data: {
            task,
            taskStatus,
          },
        });
      } else {
        res.status(200).send({
          message: 'Task fetched successfully',
          data: {
            task,
            taskStatus: [],
          },
        });
      }
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async assigneAgent(req: CustomRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const { taskId, agentId } = req.body;
      const adminId = req.user.user.id;

      const task = await Task.findOne({ _id: taskId }, { status: 1, task_id: 1, fulfillments: 1, 'product.items': 1 });
      if (!task) {
        throw new NoRecordFoundError(MESSAGES.TASK_NOT_EXIST);
      }

      const updatedTask = await taskService.assigneAgent(taskId, agentId, adminId);
      const updateStatus = {
        status: 'Agent-assigned',
        taskId: updatedTask._id,
      };
      await taskStatusService.create(updateStatus);
      const notificationData = {
        type: 'Task',
        typeId: updatedTask._id,
        status: 'Unread',
        userId: updatedTask.assignee,
        text: updatedTask.status,
      };
      const notification = await notificationService.create(notificationData);

      eventEmitter.emit('agentAssigned', { task, notification });
      eventEmitter.emit('live_update', { task: 'updated' });
      res.send({ message: 'Driver assigned for the task.' });
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { taskId, status } = req.body;
      const updatedTask = await taskService.updateStatus(taskId, status);
      if (updatedTask) {
        eventEmitter.emit('statusUpdate', {
          task_id: updatedTask._id,
          status: updatedTask.status,
        });

        //send sms or email to driver.
        eventEmitter.emit('live_update', { task: 'updated' });

        if (updatedTask?.status === 'RTO-Initiated')
          res.send({ message: 'This order is RTO-Initiated, Please deliver back to origin' });
        else res.send({ message: 'Task status updated.' });
      }
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async updateTask(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const updatedData = req.body;

      const updatedTask = await taskService.updateTask(updatedData);
      if (updatedTask) {
        const updateStatus = {
          status: 'Agent-assigned',
          taskId: updatedTask._id,
        };
        await taskStatusService.create(updateStatus);
        eventEmitter.emit('live_update', { task: 'updated' });
        res.send({ message: 'Task updated successfully', task: updatedTask });
      }
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async cancelTask(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user.user.id;
      const data = req.body;
      await taskService.cancelTask(data, userId);
      eventEmitter.emit('live_update', { task: 'updated' });

      res.status(200).json({
        message: 'Task cancelled successfully',
      });
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async lockAgent(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const updatedData = req.body;
      const updatedTask: any = await taskService.lockAgent(updatedData);
      const toUpdate = {
        isAvailable: false,
      };
      const updatedAgent = await agentService.updateAvailability(toUpdate, updatedData.agentId);
      if (updatedAgent) {
        const updateStatus = {
          status: 'Pending',
          taskId: updatedTask._id,
        };
        await taskStatusService.create(updateStatus);
        eventEmitter.emit('live_update', { task: 'updated' });

        res.status(200).send(updatedTask);
      }
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async lockAgentForTask(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const updatedData = req.body;
      const updatedTask: any = await taskService.createTask({ ...updatedData, cancellation_terms, tags });
      const toUpdate = {
        isAvailable: false,
      };
      const updatedAgent = await agentService.updateAvailability(toUpdate, updatedData.agentId);
      if (updatedAgent) {
        const updateStatus = {
          status: 'Pending',
          taskId: updatedTask._id,
        };
        await taskStatusService.create(updateStatus);
        eventEmitter.emit('live_update', { task: 'updated' });

        res.status(200).send(updatedTask);
      }
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }
  async toggleIsOnline(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const id = req.user.user.id;
      const { isOnline } = req.body;
      const response = await agentService.toggleIsOnline(id, isOnline);
      if (response.notify) {
        eventEmitter.emit('toggleIsOffline', {
          agentId: response.agentId,
          taskId: response.task._id,
        });
      }

      eventEmitter.emit('live_update', { driver: 'status change' });
      res.status(200).send({
        msg: 'Status changed successfully',
      });
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async reAssign(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const { taskId, agentId } = req.body;
      const adminId = req.user.user.id;
      await taskService.reAssignAgent(taskId, agentId, adminId);

      res.status(200).json({
        message: 'Agent re-assigned to the task',
      });
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const { transaction_id, cancellationReasonId } = req.body;
      const updatedTask = await taskService.cancel(transaction_id, cancellationReasonId);
      eventEmitter.emit('live_update', { task: 'updated' });

      const notificationData = {
        type: 'Task',
        typeId: updatedTask._id,
        status: 'Unread',
        userId: updatedTask.assignee,
        text: updatedTask.status,
      };
      await notificationService.create(notificationData);
      res.status(200).send({
        message: 'Order cancelled successfully',
        data: updatedTask,
      });
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async taskHistory(req: CustomRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user.user.id;
      const agentData = await agentService.getAgent(userId);
      const agentTaskHistory = await taskService.agentTaskHistory({ agentId: agentData?._id });
      res.status(200).send({
        message: 'History found.',
        data: agentTaskHistory,
      });
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async getTaskStatus(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { transaction_id, orderId } = req.body;
      const taskStatus = await taskService.getTaskStatus(transaction_id, orderId);
      res.status(200).send({ data: taskStatus });
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async updateTaskProtocol(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const dataToUpdate = req.body;
      const updatedTask = await taskService.updateTaskProtocol(dataToUpdate);
      res.status(200).send({
        message: 'Task updated successfully',
        updatedTask,
      });
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async trackOrder(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { transaction_id, order_id } = req.body;
      const taskStatus = await taskService.getTaskStatus(transaction_id, order_id);
      res.status(200).send({ data: taskStatus });
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }
}

export default TaskController;
