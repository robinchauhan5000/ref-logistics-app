import express from 'express';
const router = express.Router();

import NotificationController from '../controllers/notification.controller';
import authentication from '../../../lib/middlewares/authentication';

const notificationController = new NotificationController();

router.post('/v1/notifications/email', authentication, notificationController.sendEmail);
router.post('/v1/notifications/sms', notificationController.sendSms);
router.post('/v1/notifications/whatsapp', notificationController.sendWhatsappSms);

export default router;
