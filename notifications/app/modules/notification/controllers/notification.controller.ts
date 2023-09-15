import NotificationService from '../v1/services/notification.service';
import { NextFunction, Request, Response } from 'express';

const notificationService = new NotificationService();

class NotificationController {
  async sendEmail(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { emailTemplate, payload } = req.body;
      await notificationService.sendEmail(emailTemplate, payload);
      return res.status(200).json({});
    } catch (error) {
      next(error);
    }
  }

  async sendSms(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { body, payload } = req.body;
      await notificationService.sendSms(body, payload);
      return res.status(200).json({});
    } catch (error) {
      next(error);
    }
  }

  async sendWhatsappSms(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { body, payload } = req.body;
      console.log(body, payload);
      await notificationService.sendWhatsappSms(body, payload);
      return res.status(200).json({});
    } catch (error) {
      next(error);
    }
  }
}

export default NotificationController;
