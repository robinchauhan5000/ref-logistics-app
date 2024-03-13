import { PriceCalcDocument } from '../../modules/main/models/pricing.model';
import { IDeliveryType, IPricingRange } from '../../interfaces/test';
import PricingService from '../../modules/main/v1/services/pricing.service';
import { deadWeightCalculation, Dimensions, volumetricWeight, Weight } from './priceCalculation';

// const data: PriceCalcDocument[] = [
//   {
//     hyper_local: {
//       basePrice: 210,
//       additional_charges: 81,
//       cgst_sgst: 115.15,
//     },
//     inter_city: {
//       delivery_type: {
//         express_delivery: {
//           lesEq_1: 210,
//           lesEq_3: 310,
//           lesEq_5: 410,
//           lesEq_7: 510,
//           lesEq_10: 610,
//           gtr_10: 710,
//           _id: '6526749b08417fb0079cc126',
//         },
//         same_day_delivery: {
//           lesEq_1: 215,
//           lesEq_3: 315,
//           lesEq_5: 415,
//           lesEq_7: 515,
//           lesEq_10: 615,
//           gtr_10: 715,
//           _id: '6526749b08417fb0079cc127',
//         },
//         next_day_delivery: {
//           lesEq_1: 310,
//           lesEq_3: 410,
//           lesEq_5: 510,
//           lesEq_7: 610,
//           lesEq_10: 710,
//           gtr_10: 810,
//           _id: '6526749b08417fb0079cc128',
//         },
//         _id: '6526749b08417fb0079cc125',
//       },
//       packing_charges: 115,
//       rto_charges: 210,
//       reverse_qc_charges: 110,
//       igst: 18,
//     },
//     _id: 'f187372f-1d81-4e02-9e79-e605337357f1',
//     createdAt: '2023-10-11T10:10:35.228Z',
//     updatedAt: '2023-10-11T10:10:35.228Z',
//     __v: 0,
//   },
// ];
const pricingService = new PricingService();

const getWeight = (weight?: Weight, dimensions?: Dimensions) => {
  console.log('size and weight: ', dimensions, weight);
  if (dimensions && weight) {
    const volWeight = volumetricWeight(dimensions);
    const deadWeight = deadWeightCalculation(weight);

    return volWeight > deadWeight ? volWeight : deadWeight;
  }

  if (dimensions) {
    return volumetricWeight(dimensions);
  }

  if (weight) {
    return deadWeightCalculation(weight);
  }
  return 0;
};
const getPriceAccWeightAndCategory = (data: PriceCalcDocument[], weight: number, deliveryType: string) => {
  if (data[0]?.inter_city) {
    const deliveryTypes: IDeliveryType = data[0].inter_city.delivery_type;
    if (deliveryType === 'Express Delivery') {
      return getPriceAccToWeight(deliveryTypes.express_delivery, weight);
    } else if (deliveryType === "Same Day Delivery") {
      return getPriceAccToWeight(deliveryTypes.same_day_delivery, weight);
    } else if (deliveryType === 'Next Day Delivery') {
      return getPriceAccToWeight(deliveryTypes.next_day_delivery, weight);
    }
  }
  return 0;
};

const getPriceAccToWeight = (data: IPricingRange, weight: number) => {
  if (weight <= 1) {
    return data.lesEq_1;
  } else if (weight <= 3) {
    return data.lesEq_3;
  } else if (weight <= 5) {
    return data.lesEq_5;
  } else if (weight <= 7) {
    return data.lesEq_7;
  } else if (weight <= 10) {
    return data.lesEq_10;
  } else {
    return data.gtr_10;
  }
};
export const p2pPricing = async (distance: number) => {
  distance = 10
  const data: PriceCalcDocument[] = await pricingService.get();
  if (data[0].hyper_local) {
    const basePrice = data[0].hyper_local?.basePrice;
    const taxCharge = data[0].hyper_local?.cgst_sgst;
    const additional_charges = data[0].hyper_local?.additional_charges;
    console.log({basePrice,taxCharge, additional_charges })
    let charge = distance - 2 > 0 ? (distance - 2) * additional_charges + basePrice : basePrice;
    console.log({charge})
    return {
      charge: charge,
      tax: charge * taxCharge * 0.01,
      rto_charges: Number((( charge+(taxCharge*0.01)) * 0.3).toFixed(2)),
    };
  }
  return {
    charge: 1,
    tax: 1,
    rto_charges: 1,
  };
};
export const p2h2pPricing = async (category: string, dimensions?: Dimensions, weight?: Weight) => {
  const data: PriceCalcDocument[] = await pricingService.get();

  const inter_city = data[0]?.inter_city;
  const dynamicWeight = getWeight(weight, dimensions);
  const price: number = getPriceAccWeightAndCategory(data, dynamicWeight, category);
  if (inter_city) {

    return {
      charge: price,
      tax: price * inter_city?.igst * 0.001,
      rto_charges: inter_city.rto_charges * price * 0.01,
      package_price: inter_city.packing_charges,

      // reverse_qc_charges: inter_city.reverse_qc_charges,
    };
  }
  return {
    charge: 1,
    tax: 1,
    rto_charges: 1,
    package_price: 1,

    // reverse_qc_charges: 1,
  };
};

