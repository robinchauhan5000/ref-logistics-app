import Twilio from 'twilio';
import mergedEnvironment from '../../config/env.config';
const mergedEnvironmentConfig = mergedEnvironment.default;
const authToken: string = mergedEnvironmentConfig.sms.pass;
const accountSid: string = mergedEnvironmentConfig.sms.user;
const from: string = mergedEnvironmentConfig.sms.sender;
const fromWhatsapp: string = mergedEnvironmentConfig.sms.whatsappSender;

const sendSmsNotificationSms = async (body: any, payload: any) => {
  const client = Twilio(accountSid, authToken);
  client.messages.create(
    {
      from: from,
      to: payload.number,
      body: body,
    },
    (err: any, info: any) => {
      if (err) {
        console.error(err);
        return err;
      }

      console.log(`Message ${info.sid} sent`);
    },
  );
};
const sendWhatsappNotification = async (body: any, payload: any) => {
  const client = Twilio(accountSid, authToken);
  client.messages.create(
    {
      from: 'whatsapp:' + fromWhatsapp,
      to: 'whatsapp:' + payload.number,
      body: body,
    },
    (err: any, info: any) => {
      if (err) {
        console.error(err);
        return err;
      }

      console.log(`Message ${info.sid} sent`);
    },
  );
};

export { sendSmsNotificationSms, sendWhatsappNotification };
