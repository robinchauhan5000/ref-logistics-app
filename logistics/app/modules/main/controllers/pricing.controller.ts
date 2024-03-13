import logger from '../../../lib/logger';
import { Request, Response, NextFunction } from 'express';
import PricingService from '../v1/services/pricing.service';

const priceService = new PricingService();
class PricingController {
  async createPricing(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const pricingData = req.body;
      const pricing = await priceService.create(pricingData);
      if (pricing) {
        return res.send({ message: 'Pricing created sucessfully ', data: pricing });
      }
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }
  async updatePricing(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const id = req.params.id;
      const newData = req.body;
      const updatedData = await priceService.update(id, newData);
      if (updatedData) {
        res.send({ message: 'Pricing updated sucessfully', data: updatedData });
      }
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }
  async getPricing(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const pricing = await priceService.get();
      if (pricing) {
        res.send({ message: 'Pricing fetched successfully', data: pricing });
      }
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }
}
export default PricingController;
