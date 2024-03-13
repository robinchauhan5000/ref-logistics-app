// import { PriceCalcDocument } from '../../modules/main/models/pricing.model';
import { IpricingCalculation } from '../../interfaces/test';

const pricing: IpricingCalculation = {
  hyper_local: {
    basePrice: 20,
    additional_charges: 8,
    cgst_sgst: 5.5,
  },
  inter_city: {
    delivery_type: {
      next_day_delivery: {
        lesEq_1: 20,
        lesEq_3: 30,
        lesEq_5: 40,
        lesEq_7: 50,
        lesEq_10: 60,
        gtr_10: 70,
      },
      same_day_delivery: {
        lesEq_1: 25,
        lesEq_3: 35,
        lesEq_5: 45,
        lesEq_7: 55,
        lesEq_10: 65,
        gtr_10: 75,
      },

      express_delivery: {
        lesEq_1: 30,
        lesEq_3: 40,
        lesEq_5: 50,
        lesEq_7: 60,
        lesEq_10: 70,
        gtr_10: 80,
      },
    },
    packing_charges: 15,
    rto_charges: 20,
    reverse_qc_charges: 10,
    igst: 8,
  },
};
export default pricing;
