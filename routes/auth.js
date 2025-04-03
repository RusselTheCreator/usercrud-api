// IMPORT LIBRARIES AND FILES
const express = require('express'); //IMPORT THE EXPRESS FRAMEWORK
const router = express.Router(); //CREATE A ROUTER INSTANCE // ALLOWS US TO DEFINE ROUTES
const jwt = require('jsonwebtoken'); //IMPORT THE JSONWEBTOKEN LIBRARY TO HANDLE JWT TOKENS
const db = require('../database/db'); //IMPORT THE DATABASE CONNECTION POOL SO IT CAN BE USED IN THIS FILE
const dotenv = require('dotenv'); //IMPORT THE DOTENV LIBRARY TO LOAD ENVIRONMENT VARIABLES FROM THE .ENV FILE
dotenv.config(); //LOADS THE ENVIRONMENT VARIABLES FROM THE .ENV FILE

const JWT_SECRET = process.env.JWT_SECRET; //GET THE JWT SECRET KEY FROM THE ENVIRONMENT VARIABLES

// DEFINE ROUTES/API ENDPOINTS
// POST REQUEST: HTTP://URL/API/AUTH/LOGIN
router.post('/login', async (req, res) => {
   const { email } = req.body; //GET THE EMAIL AND PASSWORD FROM THE REQUEST BODY

   if(!email) 
   {
      // SEND A 400 BAD REQUEST RESPONSE TO THE CLIENT AS A JSON RESPONSE
      return res.status(400).json({error: 'email is required'});
   }
   else
   {
      try
      {
         // QUERY THE DATABASE TO CHECK IF THE USER EXISTS
         const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
         
         if(result.rows.length === 0)
         {
            // SEND A 401 UNAUTHORIZED RESPONSE TO THE CLIENT AS A JSON RESPONSE
            return res.status(401).json({error: 'Invalid email'});
         }
         else
         {
            const user = result.rows[0]; //GET THE LOGGED IN USER DATA FROM THE DATABASE

            // CREATE A JWT TOKEN WITH THE USER'S ID AND EMAIL
            const token = jwt.sign(
               { userId: user.id, email: user.email }, 
               JWT_SECRET, 
               { expiresIn: '1h' });

            // LET THE CLIENT KNOW THAT THE LOGIN WAS SUCCESSFUL AND SEND THE TOKEN
            res.status(200).json({ message: 'Login successful', user: {id: user.id, name: user.name, email: user.email, created_at: user.created_at}, token });
         }
      }
      catch (error)
      {
         // IF AN ERROR OCCURS, LOG THE ERROR AND SEND A 500 INTERNAL SERVER ERROR RESPONSE TO THE CLIENT
         console.error('Error during login:', error);

         // SEND A 500 INTERNAL SERVER ERROR RESPONSE TO THE CLIENT AS A JSON RESPONSE
         return res.status(500).json({error: 'Internal server error'});
      }
   }
});

//EXPORT THE ROUTER SO IT CAN BE USED IN THE MAIN APPLICATION OR OTHER PARTS OF THE APPLICATION
module.exports = router; 

