import authentication from '../../../lib/middlewares/authentication';
import express from 'express';
import PricingController from '../controllers/pricing.controller';
import validationMiddleware from '../v1/middleware/api.validator';
import pricingvalidationSchema from '../v1/validationSchema/pricing.validation.schema';
const router = express.Router();

const priceController = new PricingController();

router.post(
  '/v1/pricing/create',
  authentication,
  validationMiddleware({ schema: pricingvalidationSchema.createPricing() }),
  priceController.createPricing,
);
router.get('/v1/pricing', 
  authentication,
 priceController.getPricing);
router.post(
  '/v1/pricing/update/:id',
  authentication,
  validationMiddleware({ schema: pricingvalidationSchema.updatePricing() }),
  priceController.updatePricing,
);
// router.delete('/v1/pricing/delete/:id', authentication, priceController.deletePricing);

export default router;
