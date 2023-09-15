import AuthenticationJwtToken from './AuthenticationJwtToken';
import { HEADERS } from './constants';
import HttpRequest from './HttpRequest';
import mergedEnvironmentConfig from '../../config/env.config';

/**
 * Used to communicate with server
 */
class ServiceApi {
  /**
   * send email
   */
  static sendEmail(data: any, currentUser: { id: any }, currentUserAccessToken: null): Promise<any> {
    return new Promise(async (resolve) => {
      // const organization = await Organization().findOne(q);
      try {
        console.log('send email');

        let accessToken;
        if (
          currentUserAccessToken &&
          currentUserAccessToken !== null &&
          typeof currentUserAccessToken !== 'undefined'
        ) {
          accessToken = currentUserAccessToken;
        } else {
          // Note: This is required for the webhook service. In such scenarios there is no logged in
          // user and therefore we use the "createdBy" userId to generate a temporary JWT
          accessToken = await AuthenticationJwtToken.getToken({
            userId: currentUser.id,
            user: currentUser,
          });
        }

        console.log('send email-----accessToken----', accessToken);
        console.log(
          'send email-----mergedEnvironmentConfig.intraServiceApiEndpoints.nes,----',
          mergedEnvironmentConfig.intraServiceApiEndpoints.nes,
        );

        const headers: any = {};
        headers[HEADERS.ACCESS_TOKEN] = `Bearer ${accessToken}`;

        const httpRequest = new HttpRequest(
          mergedEnvironmentConfig.intraServiceApiEndpoints.nes,
          '/api/v1/nes/email',
          'POST',
          { ...data },
          headers,
        );

        const result = await httpRequest.send();

        const user = result.data.data;

        resolve(user);
      } catch (err) {
        console.log(err);
      }
    });
  }
}

export default ServiceApi;
