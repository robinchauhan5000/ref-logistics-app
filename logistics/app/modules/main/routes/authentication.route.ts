import authentication from '../../../lib/middlewares/authentication';
import express from 'express';
const router = express.Router();
import AuthenticationController from '../controllers/authentication.controller';
import validationMiddleware from '../v1/middleware/api.validator';

// import { authentication } from '../../lib/authentication'
// import { SYSTEM_ROLE } from '../../../lib/utils/constants'
// import { authSchema } from '../lib/api-params-validation-schema';
import authenticationValidationSchema from '../v1/validationSchema/api-validation-schema/authentication.validation.schema';

const authenticationController = new AuthenticationController();

// router.use('/auth', appVersionValidator.middleware());

router.post(
  '/v1/auth/login',
  validationMiddleware({ schema: authenticationValidationSchema.login() }),
  authenticationController.login,
);

router.post(
  '/v1/auth/loginviaMobile',
  validationMiddleware({ schema: authenticationValidationSchema.loginviaMobile() }),
  authenticationController.loginviaMobile,
);

router.post('/v1/auth/googleLogin', authenticationController.googleLogin);

router.post(
  '/v1/auth/createPassword',
  validationMiddleware({ schema: authenticationValidationSchema.setPassword() }),
  authenticationController.createPassword,
);

router.get('/v1/auth/verifyInviteLink/:userId', authenticationController.verifyInviteLink);
// router.post('/v1/auth/forgotPassword', authenticationController.forgotPassword)

router.post('/v1/auth/logout', authentication, authenticationController.logout);

// /**
//  * API to generate 6 digit PIN
//  */
router.post(
  '/v1/auth/forgotPassword',
  validationMiddleware({ schema: authenticationValidationSchema.forgotPassword() }),
  authenticationController.forgotPassword,
);

router.post(
  '/v1/auth/changePassword',
  authentication,
  validationMiddleware({ schema: authenticationValidationSchema.changePassword() }),
  authenticationController.changePassword,
);

// router.post('/v1/auth/updatePassword', authenticationController.updatePassword)

// /**
//  * API to reset existing PIN
//  */
router.post('/v1/auth/resetPassword', authenticationController.resetPassword);

router.get('/v1/auth/mmi/token', authenticationController.mmiToken);
router.post('/v1/auth/checkContact', authenticationController.checkContactNumber);

// router.put(
//   '/v1/auth/grantAccess/:id',
//   authentication.middleware(),
//   authorisation.middleware({ roles: [SYSTEM_ROLE.SUPER_ADMIN] }),
//   authenticationController.grantAccess,
// )

export default router;
