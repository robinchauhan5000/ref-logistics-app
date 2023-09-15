export const EMAIL_TEMPLATES = {
  FORGOT_PASSWORD: 'FORGOT_PASSWORD',
  SIGN_UP: 'SIGN_UP',
};

export const DEVICE_TYPE = {
  IOS_TYPE_ID: '00000000-0000-0000-0000-000000005002',
  ANDROID_TYPE_ID: '00000000-0000-0000-0000-000000005001',
};

export const HEADERS = {
  ACCESS_TOKEN: 'access-token',
  AUTH_TOKEN: 'Authorization',
};

export const ACCESS_TYPES = {
  PRIVATE: 'PRIVATE',
  PUBLIC: 'PUBLIC',
};

export const GENDERS = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
};

export const SYSTEM_ROLE = {
  SUPER_ADMIN: 'Super Admin',
  ORG_ADMN: 'Organization Admin',
};
// export const GENDERS = GENDERS
// export const SYSTEM_ROLE = SYSTEM_ROLE

export const RETURN_REASONS = [
  {
    key: '001',
    value: 'Buyer does not want product any more',
    isApplicableForNonReturnable: false,
  },
  {
    key: '002',
    value: 'Product available at lower than order price',
    isApplicableForNonReturnable: false,
  },
  {
    key: '003',
    value: 'Product damaged or not in usable state',
    isApplicableForNonReturnable: true,
  },
  {
    key: '004',
    value: 'Product is of incorrect quantity or size',
    isApplicableForNonReturnable: true,
  },
  {
    key: '005',
    value: 'Product delivered is different from what was shown and ordered',
    isApplicableForNonReturnable: true,
  },
];
