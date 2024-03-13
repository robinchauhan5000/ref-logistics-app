const Joi = require('joi');

const IPricingRangeSchema = Joi.object({
  lesEq_1: Joi.number().required().messages({
    'number.base': 'lesEq_1 is required and must be a number',
  }),
  lesEq_3: Joi.number().required().messages({
    'number.base': 'lesEq_3 is required and must be a number',
  }),
  lesEq_5: Joi.number().required().messages({
    'number.base': 'lesEq_5 is required and must be a number',
  }),
  lesEq_7: Joi.number().required().messages({
    'number.base': 'lesEq_7 is required and must be a number',
  }),
  lesEq_10: Joi.number().required().messages({
    'number.base': 'lesEq_10 is required and must be a number',
  }),
  gtr_10: Joi.number().required().messages({
    'number.base': 'gtr_10 is required and must be a number',
  }),
});

const IDeliveryTypeSchema = Joi.object({
  express_delivery: IPricingRangeSchema.required().messages({
    'any.required': 'express_delivery is required and must be a valid',
  }),
  // same_day_delivery: IPricingRangeSchema.required().messages({
  //   'any.required': 'same_day_delivery is required and must be a valid ',
  // }),
  next_day_delivery: IPricingRangeSchema.required().messages({
    'any.required': 'next_day_delivery is required and must be a valid ',
  }),
});

const IHyperLocalSchema = Joi.object({
  basePrice: Joi.number().required().messages({
    'number.base': 'basePrice is required and must be a number',
  }),
  additional_charges: Joi.number().required().messages({
    'number.base': 'additional_charges is required and must be a number',
  }),
  cgst_sgst: Joi.number().required().messages({
    'number.base': 'cgst_sgst is required and must be a number',
  }),
});

const IinterCitySchema = Joi.object({
  delivery_type: IDeliveryTypeSchema.required().messages({
    'any.required': 'delivery_type is required and must be a valid',
  }),
  packing_charges: Joi.number().required().messages({
    'number.base': 'packing_charges is required and must be a number',
  }),
  rto_charges: Joi.number().required().messages({
    'number.base': 'rto_charges is required and must be a number',
  }),
  reverse_qc_charges: Joi.number().required().messages({
    'number.base': 'reverse_qc_charges is required and must be a number',
  }),
  igst: Joi.number().required().messages({
    'number.base': 'igst is required and must be a number',
  }),
});

const IpricingCalculationSchema = Joi.object({
  hyper_local: IHyperLocalSchema.optional().messages({
    'object.base': 'hyper_local validation failed',
  }),
  inter_city: IinterCitySchema.optional().messages({
    'object.base': 'inter_city validation failed',
  }),
});

export default {
  createPricing: () => {
    return IpricingCalculationSchema;
  },

  updatePricing: () => {
    return IpricingCalculationSchema;
  },
};
