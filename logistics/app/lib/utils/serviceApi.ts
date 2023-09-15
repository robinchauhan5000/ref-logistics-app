import AuthenticationJwtToken from './AuthenticationJwtToken';
import mergedEnvironmentConfig from '../../config/env.config';
import axios from 'axios';

const notificationServiceURL = mergedEnvironmentConfig.default.intraServiceApiEndpoints.notification;
/**
 * Used to communicate with another service
 */
class ServiceApi {
  /**
   * send email
   */
  static async sendEmail(data: any, currentUser: { id: string }, currentUserAccessToken: string): Promise<any> {
    try {
      let accessToken: string;
      if (currentUserAccessToken) {
        accessToken = currentUserAccessToken;
      } else {
        // Note: This is required for the webhook service. In such scenarios there is no logged in
        // user and therefore we use the "createdBy" userId to generate a temporary JWT
        accessToken = await AuthenticationJwtToken.getToken({
          user: currentUser,
        });
      }

      console.log('NOTIFICATION URL', notificationServiceURL);

      return await axios({
        method: 'POST',
        url: `${notificationServiceURL}/api/v1/notifications/email`,
        data,
        headers: {
          Authorization: `${accessToken}`,
        },
      });
    } catch (err) {
      return err;
    }
  }
}

export default ServiceApi;
