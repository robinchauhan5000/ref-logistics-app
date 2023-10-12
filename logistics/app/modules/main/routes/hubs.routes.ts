import express from 'express';
const router = express.Router();

import HubController from '../controllers/hubs.controller';
import validationMiddleware from '../v1/middleware/api.validator';
import hubValidationSchema from '../v1/validationSchema/api-validation-schema/hub.validation.schema';
import authentication from '../../../lib/middlewares/authentication';
const hubController = new HubController();

router.post(
  '/v1/hub/create',
  authentication,
  validationMiddleware({ schema: hubValidationSchema.createHub() }),
  hubController.createHub,
);
router.get('/v1/hub/hubList', authentication, hubController.getAllHubs);
router.get('/v1/hub/:id', authentication, hubController.getHubById);
router.post(
  '/v1/hub/update/:id',
  authentication,
  validationMiddleware({ schema: hubValidationSchema.updateHub() }),
  hubController.updateHubDetails,
);
router.post('/v1/hub/delete/:id', authentication, hubController.deleteHub);

export default router;
