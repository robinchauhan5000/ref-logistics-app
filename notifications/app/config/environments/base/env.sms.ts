export default {
  sms: {
    user: process.env.TWILIO_USER,
    pass: process.env.TWILIO_PASSWORD,
    sender: process.env.TWILIO_SENDER,
    whatsappSender: process.env.TWILIO_WHATSAPP_SENDER,
  },
};
