// THIS FILE CONTAINS THE ROUTES FOR THE AUTHENTICATION RESOURCE
// IT IS USED TO HANDLE THE LOGIN, LOGOUT, AND REGISTRATION PROCESS FOR THE API

// IMPORT LIBRARIES AND FILES
const express = require('express'); //IMPORT THE EXPRESS FRAMEWORK
const router = express.Router(); //CREATE A ROUTER INSTANCE // ALLOWS US TO DEFINE ROUTES
const jwt = require('jsonwebtoken'); //IMPORT THE JSONWEBTOKEN LIBRARY TO HANDLE JWT TOKENS
const db = require('../database/db'); //IMPORT THE DATABASE CONNECTION POOL SO IT CAN BE USED IN THIS FILE
const dotenv = require('dotenv'); //IMPORT THE DOTENV LIBRARY TO LOAD ENVIRONMENT VARIABLES FROM THE .ENV FILE
dotenv.config(); //LOADS THE ENVIRONMENT VARIABLES FROM THE .ENV FILE
const brcyptjs = require('bcryptjs'); // IMPORT THE BCRYPTJS LIBRARY FOR HASHING AND SALTING PASSWORDS

const JWT_SECRET = process.env.JWT_SECRET; //GET THE JWT SECRET KEY FROM THE ENVIRONMENT VARIABLES

// DEFINE ROUTES/API ENDPOINTS

// POST REQUEST: HTTP://URL/API/AUTHENTICATION/REGISTER
router.post('/register', async (req, res) => {
   const { name, email, password, role } = req.body;
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

   // VALIDATION CHECKS
   if(!name || typeof name !== 'string' || name.length < 2)
   {
      return res.status(400).json({ error: 'Name must be atleast 2 characters' });
   }
   if(!email || typeof email !== 'string' || !email.match(emailRegex))
   {
      return res.status(400).json({ error: 'Invalid email address' });
   }
   else
   {
      // CHECK IF EMAIL ALREADY EXISTS
      const resultExistingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      
      if(resultExistingUser.rows.length > 0)
      {
         return res.status(400).json({ error: 'Invalid email, email already exists.' });
      }
   }
   if(!password || typeof password !== 'string' || password.length < 8)
   {
      return res.status(400).json({ error: 'Password must be atleast 8 characters' });
   }

   try
   {
      // HASH AND SALT THE PASSWORD
      const hashedPassword = await brcyptjs.hash(password, 10);

      // QUERY THE DATABASE TO INSERT THE NEW USER INTO THE DATABASE
      const resultInsertUser = await db.query('INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role', [name, email, hashedPassword, role]);

      // SEND A 201 CREATED RESPONSE TO THE CLIENT AS A JSON RESPONSE
      return res.status(201).json({message: 'User registered successfully', user: resultInsertUser.rows[0]});  
   }
   catch (error)
   {
      // IF AN ERROR OCCURS, LOG THE ERROR AND SEND A 500 INTERNAL SERVER ERROR RESPONSE TO THE CLIENT
      console.error('Error during registration:', error);

      // SEND A 500 INTERNAL SERVER ERROR RESPONSE TO THE CLIENT AS A JSON RESPONSE
      return res.status(500).json({error: 'Internal server error'});
   }
});

// POST REQUEST: HTTP://URL/API/AUTHENTICATION/LOGIN
router.post('/login', async (req, res) => {
   const { email, password } = req.body; //GET THE EMAIL AND PASSWORD FROM THE REQUEST BODY
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   let resultExistingUser = {};

   // VALIDATION CHECKS
   if(!email || typeof email !== 'string' || !email.match(emailRegex))
   {
      return res.status(400).json({ error: 'Invalid email address' });
   }
   else
   {
      // GET THE USER DATA FROM THE DATABASE
      resultExistingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);

      if(resultExistingUser.rows.length == 0)
      {
         return res.status(400).json({ error: 'Invalid email, email does not exist.' });
      }
   }
   if(!password || typeof password !== 'string' || password.length < 8)
   {
      return res.status(400).json({ error: 'Password must be atleast 8 characters' });
   }

   try
   {
      //GET THE LOGGED IN USER DATA FROM THE DATABASE
      const user = resultExistingUser.rows[0]; 

      // COMPARE THE PASSWORDS
      const passwordMatchCheck = await brcyptjs.compare(password, user.password);

      if(!passwordMatchCheck) 
      {
         // SEND A 401 UNAUTHORIZED RESPONSE TO THE CLIENT AS A JSON RESPONSE
         return res.status(401).json({ error: 'Invalid password.' });
      }
            
      // CREATE A JWT TOKEN WITH THE USER'S ID AND EMAIL
      const jwtToken = jwt.sign(
         { userId: user.id, email: user.email, role: user.role }, //PAYLOAD
         JWT_SECRET, 
         { expiresIn: '1h' });

      // LET THE CLIENT KNOW THAT THE LOGIN WAS SUCCESSFUL AND SEND THE JWT TOKEN
      res.status(200).json({ message: 'Login successful', user: {id: user.id, name: user.name, email: user.email, role: user.role, created_at: user.created_at}, jwtToken });
   }
   catch (error)
   {
      // IF AN ERROR OCCURS, LOG THE ERROR AND SEND A 500 INTERNAL SERVER ERROR RESPONSE TO THE CLIENT
      console.error('Error during login:', error);

      // SEND A 500 INTERNAL SERVER ERROR RESPONSE TO THE CLIENT AS A JSON RESPONSE
      return res.status(500).json({error: 'Internal server error'});
   }  
});

//EXPORT THE ROUTER SO IT CAN BE USED IN THE MAIN APPLICATION OR OTHER PARTS OF THE APPLICATION
module.exports = router; 

