export default {
  mongodb: {
    username: process.env.MONGODB_DATABASE_USERNAME,
    password: process.env.MONGODB_DATABASE_PASSWORD,
    name: process.env.MONGODB_DATABASE_NAME,
    host: process.env.MONGODB_DATABASE_HOST,
  },
  postgress: {
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
  }
};
