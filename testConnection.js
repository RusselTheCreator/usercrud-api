// IMPORT LIBRARIES/DEPENDENCIES
const db = require('./database/db');

async function testConnection() 
{
   try 
   {
      const client = await db.connect(); // connect to the database
      console.log('Successfully connected to the database! 🎉');

      // Test query
      const result = await client.query('SELECT NOW()');
      console.log('Database time:', result.rows[0].now);

      // Release the client
      client.release(); //
      
      // Close the pool
      await db.end();
      
      console.log('Connection test completed successfully! ✅');
   } 
   catch (error) 
   {
      console.error('Error connecting to the database:', error.message);
      console.error('Full error:', error);
   }
}

testConnection();
