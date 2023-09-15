import Joi from 'joi';

export default {
  login: () => {
    return Joi.object({
      email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
          'string.empty': 'Email is required.',
          'string.base': 'Email must be a valid string.',
          'string.email': 'Email must be a valid email address.',
          'string.required': 'Email is required.',
        }),
      password: Joi.string().required().messages({
        'string.empty': 'Password is required.',
      }),
    });
  },
  loginviaMobile: () => {
    return Joi.object({
      mobile: Joi.string().required().min(10).max(10).messages({
        'string.empty': 'Mobile number is required.',
        'string.min': 'Mobile Number should not be less than 10',
        'string.max': 'Mobile Number should not be more than 10',
        'string.required': 'Mobile number is required.',
      }),
      otp: Joi.string().required().messages({
        'string.empty': 'OTP is required.',
      }),
    });
  },
  forgotPassword: () => {
    return Joi.object({
      email: Joi.string().required().messages({
        'string.empty': 'Email is required.',
        'string.base': 'Email must be a valid string.',
        'string.email': 'Email must be a valid email address.',
        'string.required': 'Email is required.',
      }),
    });
  },
  changePassword: () => {
    return Joi.object({
      currentPassword: Joi.string().required().messages({
        'string.empty': 'Current Password is required.',
      }),
      newPassword: Joi.string().required().messages({
        'string.empty': 'New Password is required.',
      }),
    });
  },

  activate: () => {
    return Joi.object({
      username: Joi.string().trim().required(),
      password: Joi.string().required(),
      deviceType: Joi.string(),
      deviceToken: Joi.string(),
      apnToken: Joi.string(),
    });
  },

  setPassword: () =>
    Joi.object({
      userId: Joi.string().required().messages({
        'string.empty': 'UserId is required.',
      }),
      password: Joi.string().required().messages({
        'string.empty': 'Password is required.',
      }),
    }),
};
