import NodeMailer from 'nodemailer';
import ejs from 'ejs';
import fs from 'fs';
import path from 'path';
import mergedEnvironment from '../../config/env.config';
const mergedEnvironmentConfig = mergedEnvironment.default;

const sendNotificationEmail = async (templateName: string, bindingParams: any) => {
  bindingParams.now = new Date();

  // configure transporter
  const templatePath = path.resolve('app/config/emailTemplates', templateName);
  const template = fs.readFileSync(templatePath, 'utf8');
  const templateData = ejs.render(template, bindingParams);
  const transporter = NodeMailer.createTransport({
    host: mergedEnvironmentConfig.email.transport.host,
    port: mergedEnvironmentConfig.email.transport.port,
    secure: true,
    auth: {
      user: mergedEnvironmentConfig.email.transport.auth.user, // sender's email id
      pass: mergedEnvironmentConfig.email.transport.auth.pass,
    },
  });

  const mailOptions = {
    // from: bindingParams.emailSender ?? mergedEnvironmentConfig.email.sender,
    from: `ONDC Logistics ${mergedEnvironmentConfig.email.transport.auth.user}`,
    to: bindingParams?.emailRecipients,
    cc: bindingParams?.emailCcRecipients,
    bcc: bindingParams?.emailBccRecipients,
    subject: bindingParams?.subject,
    html: templateData,
    // subject: ejs.render(emailTemplates[templateName].SUBJECT)(bindingParams),
    // text: Handlebars.compile(emailTemplates[templateName].BODY)(bindingParams),
  };

  // send mail
  transporter.sendMail(mailOptions, (error: any, info: any) => {
    if (error) {
      console.error(error);
      return;
    }

    console.log(`Message ${info.messageId} sent: ${info.response}`);
  });
};

export default sendNotificationEmail;
