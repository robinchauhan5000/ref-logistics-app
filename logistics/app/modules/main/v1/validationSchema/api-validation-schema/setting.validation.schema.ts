import Joi from 'joi';

export default {
  settings: () => {
    return Joi.object({
      pricePerDistance: Joi.object({
        unit: Joi.string().valid('km').required().messages({
          'string.empty': 'unit is required',
        }),
        value: Joi.number().required().messages({
          'string.empty': 'value is required',
        }),
      }).required(),
      pricePerWeight: Joi.object({
        unit: Joi.string().valid('kilogram', 'gram').required().messages({
          'string.empty': 'unit is required',
        }),
        value: Joi.number().required().messages({
          'string.empty': 'value is required',
        }),
        type: Joi.string().valid('dead_weight', 'volumetric_weight').required().messages({
          'string.empty': 'value is required',
        }),
      }).required(),
    });
  },
};
