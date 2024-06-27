

import { Router } from 'express';
import authenticationRouter from '../modules/main/routes/authentication.route';
import userRouter from '../modules/main/routes/user.route';
import agentRouter from '../modules/main/routes/agent.route';
import taskRouter from '../modules/main/routes/task.route';
import taskStatusRouter from '../modules/main/routes/taskStatus.route';
import healthCheck from '../modules/main/routes/healthCheck.route';
import taskNotifications from '../modules/main/routes/notification.routes';
import applicationSetting from '../modules/main/routes/applicationSetting.route';
import issueRouter from '../modules/main/routes/issue.route';
import hubsRouter from '../modules/main/routes/hubs.routes';
import pricingRouter from '../modules/main/routes/pricing.routes';
import subscribeRouter from '../modules/main/routes/subscribe.route';
import ondcRequestRouter from '../modules/main/routes/ondcRequest.route';

const routes: Router = Router();

// Add your routes here
routes.use(healthCheck);
routes.use(authenticationRouter);
routes.use(userRouter);
routes.use(agentRouter);
routes.use(taskRouter);
routes.use(taskStatusRouter);
routes.use(taskNotifications);
routes.use(applicationSetting);
routes.use(issueRouter);
routes.use(hubsRouter);
routes.use(pricingRouter);
routes.use(subscribeRouter);
routes.use(ondcRequestRouter);

export default routes;
