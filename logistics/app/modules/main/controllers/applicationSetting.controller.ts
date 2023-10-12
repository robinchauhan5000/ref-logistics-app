import { NextFunction, Request, Response } from 'express';
import ApplicationSettingService from '../v1/services/applicationSetting.service';
import logger from '../../../lib/logger';

const applicationSettingService = new ApplicationSettingService();

class ApplicationSettingController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      await applicationSettingService.createSetting(data);
      res.status(200).json({
        message: 'Support details updated successfully',
      });
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const applicationSettings = await applicationSettingService.getSupport();
      res.status(200).json({
        data: applicationSettings,
      });
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }
}

export default ApplicationSettingController;
