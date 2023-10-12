import mongoose, { ConnectOptions } from 'mongoose';
// import { MongoClientOptions } from 'mongodb'
import mergedEnvironmentConfig from '../config/env.config';

interface MongooseConnectOptions extends ConnectOptions {
  useNewUrlParser?: boolean;
}

const dbOptions: MongooseConnectOptions = {
  useNewUrlParser: true,
};

const config = mergedEnvironmentConfig?.default?.mongodb;
console.log(`config: ${JSON.stringify(config)}`);

mongoose.connect(`${config.host}/${config.name}`, dbOptions);

mongoose.Promise = global.Promise;


mongoose.set('debug', (collectionName: string, method: string, query: any, doc: any) => {
  console.log(`[MONGOOS]:${collectionName}.${method}`, JSON.stringify(query), doc);
});
