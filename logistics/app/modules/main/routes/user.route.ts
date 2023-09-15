import express from 'express';
const router = express.Router();

import UserController from '../controllers/user.controller';
import authentication from '../../../lib/middlewares/authentication';
import validationMiddleware from '../v1/middleware/api.validator';

import agentValidationSchema from '../v1/validationSchema/api-validation-schema/agent.validation.schema';
import userValidationSchema from '../v1/validationSchema/api-validation-schema/user.validation.schema';
import settingsValidationSchema from '../v1/validationSchema/api-validation-schema/setting.validation.schema';

const userController = new UserController();

router.post(
  '/v1/users/invite/admin',
  authentication,
  validationMiddleware({ schema: userValidationSchema.adminsSchema() }),

  userController.invite,
);

router.post(
  '/v1/users/invite/agent',
  authentication,
  validationMiddleware({ schema: agentValidationSchema.inviteAgent() }),
  userController.inviteAgent,
);

router.get('/v1/users/getProfile', authentication, userController.getProfile);
router.get('/v1/users/getDashboard', authentication, userController.getDashoardData);
router.get('/v1/users/list', authentication, userController.listUsers);
router.get('/v1/drivers/list', authentication, userController.listDrivers);
router.get('/v1/admins/list', authentication, userController.listAdmins);
router.post('/v1/users/updateProfile', authentication, userController.updateProfile);
router.post(
  '/v1/users/settings',
  validationMiddleware({ schema: settingsValidationSchema.settings() }),
  authentication,
  userController.userSettings,
);
router.post('/v1/admins/alter', authentication, userController.alter);

export default router;
