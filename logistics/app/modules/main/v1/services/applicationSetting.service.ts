import InternalServerError from '../../../../lib/errors/internal-server-error.error';
import ApplicationSetting from '../../models/applicationSettings.model';
import MESSAGES from '../../../../lib/utils/messages';

class ApplicationSettingService {
  async createSetting(data: any) {
    try {
      const settingCount = await ApplicationSetting.find().count();
      if (settingCount > 0) {
        const existingSettings: any = await ApplicationSetting.find();
        const email = existingSettings[0].email;
        await ApplicationSetting.updateOne({ email: email }, { $set: data });
      } else {
        const applicationSettingData = new ApplicationSetting(data);
        await applicationSettingData.save();
      }
    } catch (error: any) {
      if (error.status === 404 || error.status === 401) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async getSupport() {
    try {
      const aplicationSettings = await ApplicationSetting.find();
      if (aplicationSettings) {
        return aplicationSettings;
      }

      return true;
    } catch (error: any) {
      if (error.status === 404 || error.status === 401) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }
}

export default ApplicationSettingService;
