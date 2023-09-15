import Joi from 'joi';

const allowedDomains = process.env.REACT_APP_ALLOWED_DOMAINS;
const adminSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .custom((value: string, helpers: { error: any }) => {
      const domain = value.split('@')[1];
      if (allowedDomains?.split(',').includes(domain)) {
        return value; // Valid email
      } else {
        console.log({ value });
        return helpers.error('any.invalid'); // Invalid email domain
      }
    })
    .messages({
      'string.empty': 'Email cannot be empty',
      'any.required': 'Email is required',
      'string.email': 'Email must be a valid email address',
      'any.invalid': 'Email domain is not allowed',
    }),
  mobile: Joi.string()
    .pattern(/^\d{10}$/)
    .required()
    .messages({
      'string.empty': 'Mobile cannot be empty',
      'any.required': 'Mobile is required',
      'string.pattern.base': 'Mobile must be a 10-digit number',
    }),
  name: Joi.string().required().messages({
    'string.empty': 'Name cannot be empty',
    'any.required': 'Name is required',
  }),
});

const adminsSchema = () => {
  return Joi.object({
    admins: Joi.array()
      .items(adminSchema)
      .unique(
        (a: { email: string; mobile: string | number }, b: { email: string; mobile: string | number }) =>
          a?.email === b?.email || a?.mobile === b?.mobile,
      )
      .messages({
        'array.unique': 'Duplicate email or mobile found',
      })
      .required()
      .messages({
        'any.required': 'Admins array is required',
      }),
  });
};

export default {
  adminsSchema,
};
