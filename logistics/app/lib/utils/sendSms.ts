import AuthenticationJwtToken from './AuthenticationJwtToken';
import axios from 'axios';
import mergedEnvironmentConfig from '../../config/env.config';
const notificationServiceURL = mergedEnvironmentConfig.default.intraServiceApiEndpoints.notification;

class SendSms {
  static async sendSms(data: any, currentUser: { id: string }): Promise<any> {
    try {
      const accessToken = await AuthenticationJwtToken.getToken({
        user: currentUser,
      });

      return await axios({
        method: 'POST',
        url: notificationServiceURL + '/api/v1/notifications/sms',
        data,
        headers: {
          Authorization: `${accessToken}`,
        },
      });
    } catch (err) {
      throw err;
    }
  }

  static async sendWhatsappSms(data: any, currentUser: { id: string }): Promise<any> {
    try {
      const accessToken = await AuthenticationJwtToken.getToken({
        user: currentUser,
      });

      return await axios({
        method: 'POST',
        url: notificationServiceURL + '/api/v1/notifications/whatsapp',
        data,
        headers: {
          Authorization: `${accessToken}`,
        },
      });
    } catch (err) {
      throw err;
    }
  }
}

export default SendSms;
