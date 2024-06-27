import { Client } from 'pg';
// import mergedEnvironmentConfig from '../config/env.config';

// const config = mergedEnvironmentConfig?.default?.postgress;

// Connection information
const connectionString = `postgresql://strapi:strapi@postgres:5432/strapi`;

// Create a new PostgreSQL client
export const pgClient = new Client({
  connectionString: connectionString,
});

// Connect to the database
pgClient.connect()
  .then(() => {
    console.log("==================.");
    console.log("Postgress database connection is established...");
  })
  .catch(error => {
    // Handle errors
    console.error('==========================: ', error);
    console.error('Error while establishing connection with postgress: ', error);
  });
