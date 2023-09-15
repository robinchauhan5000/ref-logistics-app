import authentication from '../../../lib/middlewares/authentication';
import ApplicationSettingController from '../controllers/applicationSetting.controller';
import express from 'express';
const router = express.Router();
const applicationSettingController = new ApplicationSettingController();

router.post('/v1/applicationSetting/create', authentication, applicationSettingController.create);
router.get('/v1/logistics/support', authentication, applicationSettingController.get);
export default router;
