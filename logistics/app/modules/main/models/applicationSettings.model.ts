import mongoose from 'mongoose';

const applicationSettingSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },

  uri: {
    type: String,
  },

  phone: {
    type: String,
  },
});

const ApplicationSetting = mongoose.model('ApplicationSetting', applicationSettingSchema);

export default ApplicationSetting;
