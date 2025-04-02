// THIS FILE SETS UP THE DATABASE CONNECTION FOR THE API

// IMPORT LIBRARIES/DEPENDENCIES
// ALLOWS US TO CREATE A POOL OF CONNECTIONS TO A POSTGRESQL DATABASE
const { Pool } = require('pg');
const dotenv = require('dotenv'); // allows us to use environment variables

dotenv.config(); // loads the environment variables from the .env file

// CONFIGURE DATABASE CONNECTION
const pool = new Pool({
   connectionString: process.env.DATABASE_URL, // connection string from the .env file
   ssl: {
      rejectUnauthorized: false, // this is to avoid SSL certificate errors
   },
});

// EXPORT THE POOL OF CONNECTIONS
// ALLOWS OTHER PARTS OF THE APPLICATION TO IMPORT AND USE THIS DATABASE CONNECTION POOL
module.exports = pool;
