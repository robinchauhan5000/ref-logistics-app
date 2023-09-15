import Joi from 'joi';
const validEnums = [
  'Express Delivery',
  'Standard Delivery',
  'Immediate Delivery',
  'Same Day Delivery',
  'Next Day Delivery',
];

const allowedDomains = process.env.REACT_APP_ALLOWED_DOMAINS;

export default {
  inviteAgent: () => {
    return Joi.object({
      currentLocation: Joi.object({
        coordinates: Joi.array().items(Joi.number()),
      }),
      email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .custom((value: string, helpers: { error: any }) => {
          const domain = value.split('@')[1];
          if (allowedDomains?.split(',').includes(domain)) {
            return value; // Valid email
          } else {
            return helpers.error('any.invalid'); // Invalid email domain
          }
        })
        .messages({
          'string.empty': 'Email is required.',
          'string.base': 'Email must be a valid string.',
          'string.email': 'Email must be a valid email address.',
          'string.required': 'Email is required.',
          'any.invalid': 'Email domain is not allowed',
        }),
      bankDetails: Joi.object({
        accountHolderName: Joi.string().required().messages({
          'string.empty': 'Account holder name is required.',
        }),
        accountNumber: Joi.string().required().messages({
          'string.empty': 'Account number is required.',
        }),
        bankName: Joi.string().required().messages({
          'string.empty': 'Bank name is required.',
        }),
        branchName: Joi.string().required().messages({
          'string.empty': 'Branch name is required.',
        }),
        IFSCcode: Joi.string().required().messages({
          'string.empty': 'IFSC code is required.',
        }),
        cancelledCheque: Joi.string().required().messages({
          'string.empty': 'Cancelled cheque is required.',
        }),
      })
        .required()
        .messages({
          'string.empty': 'Bank details are required.',
        }),
      mobile: Joi.string().required().messages({
        'string.empty': 'Mobile is required.',
        // 'string.required': 'Mobile number is required',
      }),
      firstName: Joi.string().required().messages({
        'string.empty': 'First name is required',
      }),
      lastName: Joi.string().required().messages({
        'string.empty': 'Last name is required',
      }),
      dob: Joi.string().required().messages({
        'string.empty': 'Date of birth is required',
      }),
      deliveryExperience: Joi.number().integer().min(0).required().messages({
        'any.empty': 'Delivery experience is required and should be a positive integer',
        'number.base': 'Delivery experience must be a number',
      }),
      KYCDetails: Joi.object({
        PANdetails: Joi.string(),
        addressProof: Joi.string().required().messages({
          'string.empty': 'Address proof is required',
        }),
        IDproof: Joi.string().required().messages({
          'string.empty': 'ID proof is required',
        }),
        PANcard: Joi.string().required().messages({
          'string.empty': 'PAN card proof is required',
        }),
        aadhaarNumber: Joi.string().min(0).required().messages({
          'number.empty': 'Aadhaar number is required',
          'number.base': 'Aadhaar number must be a number',
          'number.min': 'Aadhaar number must be a positive number',
        }),
        drivingLicense: Joi.string().required().messages({
          'string.empty': 'Address proof is required',
        }),
      })
        .required()
        .messages({
          'string.empty': 'KYC details are required.',
        }),
      vehicleDetails: Joi.object({
        vehicleNumber: Joi.string().required().messages({
          'string.empty': 'Vehicle number is required.',
        }),
        brandName: Joi.string().optional(),
        ownerType: Joi.string().optional(),
        intercity: Joi.string().optional(),

        makeYear: Joi.number().integer().min(1900).max(new Date().getFullYear()).required().messages({
          'string.empty': 'Make year of vehicle is required.',
        }),
        vehicleRegistrationDocument: Joi.string().required().messages({
          'string.empty': 'Vehicle Registration Document is required.',
        }),
        maxWeightCapacity: Joi.object({
          weight: Joi.number().positive().required().messages({
            'string.empty': 'Weight detail is required.',
          }),
          unit: Joi.string().valid('kg', 'lbs').required().messages({
            'string.empty': 'Unit is required.',
          }),
        }).required(),
      })
        .required()
        .messages({
          'string.empty': 'Vehicle details are required.',
        }),
      emailNotification: Joi.boolean().required(),
      whatsAppNotification: Joi.boolean().required(),
      deliveryType: Joi.array().items(Joi.string().valid(...validEnums)),
      addressDetails: Joi.object({
        pincode: Joi.string().required().messages({
          'string.empty': 'pincode is required.',
        }),
        location: Joi.object({
          coordinates: Joi.array()
            .items(
              Joi.number().messages({
                'number.base': 'Coordinates must be a number',
                'number.empty': 'Coordinates are required.',
              }),
            )
            .length(2)
            .required()
            .messages({
              'array.base': 'Coordinates must be an array',
              'array.length': 'Coordinates must contain exactly 2 items',
              'any.required': 'Coordinates are required',
            }),
        })
          .required()
          .messages({
            'object.empty': 'Location coordinates is required.',
          }),
        building: Joi.string().required().messages({
          'string.empty': 'Building number is required.',
        }),
        city: Joi.string().required().messages({
          'string.empty': 'City name is required.',
        }),
        state: Joi.string().required().messages({
          'string.empty': 'State name is required.',
        }),
        country: Joi.string().required().messages({
          'string.empty': 'Country name is required.',
        }),
        locality: Joi.string().required().messages({
          'string.empty': 'Local address is required.',
        }),
      })
        .required()
        .messages({
          'string.empty': 'Address details are required.',
        }),
    });
  },
};
