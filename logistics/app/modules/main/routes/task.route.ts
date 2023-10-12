import express from 'express';
const router = express.Router();

import TaskController from '../controllers/task.controller';
import TaskControllerV2 from '../controllers/task.controllerV2';
// import authentication from 'app/lib/middlewares/authentication';
import authentication from '../../../lib/middlewares/authentication';
const taskController = new TaskController();
const taskControllerV2 = new TaskControllerV2();


// router.post('/v1/logistics/agent/search', taskController.create);
router.get('/v1/task/get/assigned', authentication, taskController.getAssignedTasks);
router.get('/v1/task/get/unassigned', authentication, taskController.getUnassignedTasks);
router.get('/v1/task/get/:id', authentication, taskController.getTask);
router.get('/v1/task/issue/:id', taskController.getIssueTask);
router.get('/v1/task/get/:id/agent',  authentication, taskController.getTaskForAgent)
router.post('/v1/task/init', taskController.lockAgent);
router.post('/v1/logistics/task/init', taskController.lockAgentForTask);
router.put('/v1/logistics/task/confirm', taskController.updateTask);
router.put('/v2/logistics/task/confirm',taskControllerV2.updateTask)
router.post('/v1/task/assigneAgent', authentication, taskController.assigneAgent);
router.post('/v1/task/updateStatus', authentication, taskController.updateStatus);
router.post('/v1/task/cancel', authentication, taskController.cancelTask);
router.post('/v1/task/reAssign', authentication, taskController.reAssign);
router.post('/v1/logistics/cancel', taskController.cancel);
router.post('/v1/logistics/taskStatus', taskController.getTaskStatus);
router.post('/v2/logistics/taskStatus', taskControllerV2.getTaskStatus);

router.post('/v1/logistics/task/updateTask', taskController.updateTaskProtocol);
router.post('/v1/logistics/trackOrder', taskController.trackOrder);
router.post('/v2/logistics/task/init', taskControllerV2.lockAgentForTask)    // for version 1.1.0 init


export default router;
