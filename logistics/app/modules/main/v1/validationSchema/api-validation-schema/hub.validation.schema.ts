const Joi = require('joi');

const locationSchema = Joi.object({
  coordinates: Joi.array()
    .items(Joi.number().messages({
        'number.base': 'Coordinate must be a number',
        'number.empty': 'Coordinates are required',
    }))
    .length(2)
    .required()
    .messages({
        'array.base': 'Coordinates must be an array',
        'array.length': 'Coordinates must contain exactly 2 items',
        'any.required': 'Coordinates are required',
    }),
});

const addressDetailsSchema = Joi.object({
  location: locationSchema,
  building: Joi.string().required().messages({
    'string.empty': 'building name is required.',
  }),
  city: Joi.string().required().messages({
    'string.empty': 'city name is required.',
  }),
  state: Joi.string().required().messages({
    'string.empty': 'state name is required.',
  }),
  country: Joi.string().required().messages({
    'string.empty': 'country name is required.',
  }),
  locality: Joi.string().required().messages({
    'string.empty': 'locality name is required.',
  }),
  pincode: Joi.string().required().messages({
    'string.empty': 'pincode name is required.',
  }),
});

const CreatehubsSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'pincode name is required.'
    }),
  addressDetails: addressDetailsSchema,
  status: Joi.string().required().messages({
    'string.empty': 'status is required'
  }),
  serviceablePincode: Joi.array().items(Joi.number().messages({
    'number.base': 'pincode must be a number',
    'number.empty': 'pincodes are required',
  }))
  .required()
  .messages({
    'array.base': 'pincodes must be an array',
    'any.required': 'pincodes are required',
  })
});

const updateAddressSchema = Joi.object({
  location: locationSchema.optional(),
  building: Joi.string().optional(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  country: Joi.string().optional(),
  locality: Joi.string().optional(),
  pincode: Joi.string().optional(),
});

const UpdatehubsSchema = Joi.object({
  name: Joi.string().optional(),
  addressDetails: updateAddressSchema.optional(),
  status: Joi.string().optional(),
  serviceablePincode: Joi.array().items(Joi.number().messages({
    'number.base': 'pincode must be a number',
    'number.empty': 'pincodes are required',
  }))
  .optional(),
});


export default {
  createHub: () => {
    return CreatehubsSchema
  },

  updateHub: () => {
    return UpdatehubsSchema
  }
}
