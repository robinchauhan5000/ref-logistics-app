import express from 'express';
const router = express.Router();

import AgentController from '../controllers/agent.controller';
import AgentControllerV2 from '../controllers/agent.controllerV2';
import TaskController from '../controllers/task.controller';
import authentication from '../../../lib/middlewares/authentication';
import upload from '../../../lib/utils/multer';

const agentController = new AgentController();
const agentControllerV2 = new AgentControllerV2();
const taskController = new TaskController();

router.post('/v1/agent/:agentId/update', authentication, agentController.updateAgent);
router.post('/v1/logistics/agent/search', agentController.searchAgent);
router.post('/v2/logistics/agent/search', agentControllerV2.searchAgent);

router.post('/v1/agent/uploadFile', authentication, upload.array('image'), agentController.uploadFile);

router.post('/v1/agent/search',authentication, agentController.search);
router.post('/v1/agent/getQuotes',authentication, agentController.getQuotes);

router.get('/v1/agent/sse', taskController.sse);
router.post('/v1/agent/location', authentication, agentController.updateLocation);
// get liveLocation of agent
router.get('/v1/agent/liveLocation/:id',authentication,agentController.getLiveLocation)
router.get('/v1/agent/getTasks', authentication, agentController.getTasks);
router.post('/v1/agent/delete/:id', authentication, agentController.delete);
router.post('/v1/agent/block', authentication, agentController.blockAgent);
router.post('/v1/agent/toggleStatus', authentication, taskController.toggleIsOnline);
router.get('/v1/agent/get/:id', authentication, agentController.get);
router.get('/v1/agent/taskHistory', authentication, taskController.taskHistory);

export default router;
