// import path from 'path'

const nodeEnvironment = process.env.NODE_ENV || 'development';
import { dirname } from 'path';

const appDir: string = dirname(require?.main?.filename || '');

// Use appDir variable
const parentDir = dirname(appDir);
const projectBaseDirectory = appDir;
const envPath = parentDir;
const appEnvironment = process.env.APP_ENV ?? 'local';
if (appEnvironment === 'local') {
  require('dotenv').config({
    path: `${envPath}/.env`,
  });
}

const environmentConfig = require('./environments/base');
const mergedEnvironmentConfig = {
  ...environmentConfig,
  nodeEnvironment,
  appEnvironment,
  projectBaseDirectory,
};
Object.freeze(mergedEnvironmentConfig);
export default mergedEnvironmentConfig;
