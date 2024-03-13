import express from 'express';
const router = express.Router();

import TaskStatusController from '../controllers/taskStatus.controller';

import authentication from '../../../lib/middlewares/authentication';
const taskStatusController = new TaskStatusController();

router.post('/v1/taskStatus/create', authentication, taskStatusController.create);
router.get('/v1/taskStatus/task/:taskId', authentication, taskStatusController.getTaskStatusList);
router.get('/v1/taskStatus/get/:id', taskStatusController.getTaskStatusById);

export default router;
