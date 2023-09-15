import baseConfig from './env.base';
import corsConfig from './env.cors';
import dbConfig from './env.db';
import mailConfig from './env.email';
import s3Config from './env.aws.s3';
import smsConfig from './env.sms';
// const mailConfig = require('./env.email');

const mergedEnvironmentConfig = {
  ...baseConfig,
  ...corsConfig,
  ...dbConfig,
  ...mailConfig,
  ...s3Config,
  ...smsConfig,
};

Object.freeze(mergedEnvironmentConfig);
export default mergedEnvironmentConfig;
