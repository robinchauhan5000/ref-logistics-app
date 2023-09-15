import express from 'express';
const router = express.Router();

import NotificationController from '../controllers/notification.controller';
import authentication from '../../../lib/middlewares/authentication';
// import authentication from '../../../lib/middlewares/authentication';
const notificationController = new NotificationController();

router.get('/v1/task/notification', authentication, notificationController.userNotifications);

export default router;
