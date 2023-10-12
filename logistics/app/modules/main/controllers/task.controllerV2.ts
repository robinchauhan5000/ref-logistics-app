import TaskService from '../v1/services/task.service';
import { NextFunction, Request, Response } from 'express';
import TaskStatusService from '../v1/services/taskStatus.service';
import AgentService from '../v1/services/agent.service';
import logger from '../../../lib/logger';
import eventEmitter from '../../../lib/utils/eventEmitter';

const taskService = new TaskService();
const agentService = new AgentService();
const taskStatusService = new TaskStatusService();

class TaskController {
  async lockAgentForTask(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const updatedData = req.body;
      const updatedTask: any = await taskService.createTask(updatedData);
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
  async updateTask(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const updatedData = req.body;

      const updatedTask = await taskService.updateTask_v2(updatedData);
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
  async getTaskStatus(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { transaction_id, orderId } = req.body;
      const taskStatus = await taskService.getTaskStatus_v2(transaction_id, orderId);
      res.status(200).send({ data: taskStatus });
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }
}

export default TaskController;
