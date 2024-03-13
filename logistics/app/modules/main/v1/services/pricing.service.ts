import { IpricingCalculation } from '../../../../interfaces/test';
import DuplicateRecordFoundError from '../../../../lib/errors/duplicate-record-found.error';
import InternalServerError from '../../../../lib/errors/internal-server-error.error';
import MESSAGES from '../../../../lib/utils/messages';
import Pricing, { PriceCalcDocument } from '../../models/pricing.model';

class PricingService {
  async create(priceData: IpricingCalculation): Promise<any> {
    try {
      return await Pricing.create(priceData);
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new DuplicateRecordFoundError(MESSAGES.PRICING_ALREADY_EXISTS);
      }
      throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async get(): Promise<PriceCalcDocument[]> {
    try {
      const pricingData = await Pricing.find();
      if (pricingData.length <= 0) {
        return [];
      } else {
        return pricingData;
      }
    } catch (error) {
      throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }
  async update(id: string, priceData: IpricingCalculation): Promise<PriceCalcDocument | any> {
    try {
      const record = await Pricing.findById({ _id: id });

      if (!record) throw new DuplicateRecordFoundError(MESSAGES.PRICING_NOT_FOUND);
      return await Pricing.findByIdAndUpdate({ _id: id }, priceData, { new: true });
    } catch (error: any) {
      if (error.status === 409) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
export default PricingService;
