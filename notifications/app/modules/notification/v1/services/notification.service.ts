/* eslint-disable no-useless-catch */
import sendNotificationEmail from '../../../../lib/email/sendEmail';
import { sendSmsNotificationSms } from '../../../../lib/sms/sendSms';
import { sendWhatsappNotification } from '../../../../lib/sms/sendSms';

class NotificationService {
  async sendEmail(emailTemplate: string, payload: any) {
    try {
      await sendNotificationEmail(emailTemplate, payload);
      return true;
    } catch (error: any) {
      throw error;
    }
  }
  async sendSms(body: string, payload: any) {
    try {
      await sendSmsNotificationSms(body, payload);
      return true;
    } catch (error: any) {
      throw error;
    }
  }

  async sendWhatsappSms(body: string, payload: any) {
    try {
      await sendWhatsappNotification(body, payload);
      return true;
    } catch (error: any) {
      throw error;
    }
  }
}

export default NotificationService;
