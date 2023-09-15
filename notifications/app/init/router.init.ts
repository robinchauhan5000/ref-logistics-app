import { Router } from 'express';
import notificationRouter from '../modules/notification/routes/notification.route';

const routes: Router = Router();

// Add your routes here
routes.use(notificationRouter);

export default routes;
